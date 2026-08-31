import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';

import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment } from './entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { SlotStatus } from '../availability/entities/slot-status.enum';

import { Role, User } from '../user/entities/user.entity';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { Therapist } from '../therapist/entities/therapist.entity';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { UpdateAppointmentOperationsDto } from './dto/update-appointment-operations.dto';
import { AppointmentStatus } from './entities/appointment-status.enum';
import { calculateSessionPackagePricing } from './session-package-pricing';
import {
  canPatientCancelAppointment,
  canTransitionAppointmentStatus,
} from './appointment-policy';
import { formatIstSlotRange } from '../common/ist-date-time';
import { isStartTimeBookable } from './booking-lead-time';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { ProviderJobService } from '../reliability/provider-job.service';
import { businessConfig } from '../config/business.config';
import { Payment } from '../payment/entities/payment.entity';
import { PaymentStatus } from '../payment/entities/payment-status.enum';
import { normalizeManualZoomLink } from './appointment-operations';
import { TherapistVerificationStatus } from '../therapist/entities/therapist-verification-status.enum';
import { getSupportedBookingModes } from '../therapist/therapist-profile.constants';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly providerJobService: ProviderJobService,
  ) {}

  async create(
    dto: CreateAppointmentDto,
    patient: JwtPayload,
  ): Promise<Appointment> {
    const patientAccount = await this.dataSource.getRepository(User).findOne({
      where: {
        id: patient.userId,
      },
    });

    if (!patientAccount) {
      throw new NotFoundException('Patient account not found');
    }

    const savedAppointment = await this.createForPatient(dto, patientAccount);

    return savedAppointment;
  }

  async createQuickBooking(dto: CreateAppointmentDto): Promise<{
    appointment: Appointment;
    accessToken: string;
    user: Pick<User, 'id' | 'email' | 'role' | 'createdAt'>;
    createdAccount: boolean;
  }> {
    if (!dto.verificationToken) {
      throw new BadRequestException('Verify your email before booking');
    }
    const verifiedIdentifier = this.authService.verifyQuickBookingToken(
      dto.verificationToken,
    );
    const email = this.normalizeEmail(dto.contactEmail);
    if (!email || verifiedIdentifier !== email) {
      throw new BadRequestException(
        'Booking email does not match the verified email',
      );
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const patientResult = await this.resolveQuickBookingPatient(dto, manager);
      const appointment = await this.createForPatient(
        dto,
        patientResult.patient,
        manager,
      );

      return {
        appointment,
        patient: patientResult.patient,
        createdAccount: patientResult.createdAccount,
      };
    });

    const accessToken = this.jwtService.sign({
      userId: result.patient.id,
      email: result.patient.email,
      role: result.patient.role,
    });

    return {
      appointment: result.appointment,
      accessToken,
      user: {
        id: result.patient.id,
        email: result.patient.email,
        role: result.patient.role,
        createdAt: result.patient.createdAt,
      },
      createdAccount: result.createdAccount,
    };
  }

  private async createForPatient(
    dto: CreateAppointmentDto,
    patientAccount: User,
    transactionManager?: EntityManager,
  ): Promise<Appointment> {
    if (transactionManager) {
      return this.createForPatientInTransaction(
        dto,
        patientAccount,
        transactionManager,
      );
    }

    return this.dataSource.transaction((manager) =>
      this.createForPatientInTransaction(dto, patientAccount, manager),
    );
  }

  private async createForPatientInTransaction(
    dto: CreateAppointmentDto,
    patientAccount: User,
    manager: EntityManager,
  ): Promise<Appointment> {
    const slotRepo = manager.getRepository(AvailabilitySlot);
    const appointmentRepo = manager.getRepository(Appointment);

    const slot = await slotRepo
      .createQueryBuilder('slot')
      .setLock('pessimistic_write', undefined, ['slot'])
      .leftJoinAndSelect('slot.therapist', 'therapist')
      .addSelect('therapist.archivedAt')
      .where('slot.id = :slotId', { slotId: dto.slotId })
      .getOne();

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (
      !slot.therapist?.isActive ||
      slot.therapist.archivedAt ||
      slot.therapist.verificationStatus !== TherapistVerificationStatus.VERIFIED
    ) {
      throw new BadRequestException(
        'The selected therapist is not currently available for booking',
      );
    }

    if (slot.status === SlotStatus.BOOKED) {
      throw new ConflictException('Selected slot has already been booked');
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new BadRequestException('Selected slot is unavailable');
    }

    if (!isStartTimeBookable(slot.startTime)) {
      throw new BadRequestException(
        'Appointments must be booked for a time at least 24 hours in advance.',
      );
    }

    const existingAppointment = await appointmentRepo.findOne({
      where: {
        slot: {
          id: slot.id,
        },
        status: Not(AppointmentStatus.CANCELLED),
      },
    });

    if (existingAppointment) {
      throw new ConflictException('Selected slot has already been booked');
    }

    slot.status = SlotStatus.BOOKED;
    await slotRepo.save(slot);

    const packagePricing = this.resolvePackagePricing(dto, slot.therapist);
    const appointment = appointmentRepo.create({
      patient: {
        id: patientAccount.id,
      } as User,
      therapist: slot.therapist,
      slot,
      notes: dto.notes,
      contactName: dto.contactName?.trim() || patientAccount?.fullName || null,
      contactEmail:
        this.normalizeEmail(dto.contactEmail) || patientAccount.email,
      contactPhone:
        this.normalizePhone(dto.contactPhone) || patientAccount?.phone || null,
      service: dto.service?.trim() || null,
      mode: dto.mode?.trim() || null,
      sessionCount: packagePricing.sessionCount,
      packageName: packagePricing.packageName,
      packageOriginalAmount: packagePricing.originalAmount,
      packageOfferAmount: packagePricing.offerAmount,
      packageDiscountPercent: packagePricing.discountPercent,
      reservationExpiresAt: new Date(
        Date.now() + this.getReservationTtlMinutes() * 60_000,
      ),
    });

    return appointmentRepo.save(appointment);
  }

  private resolvePackagePricing(
    dto: CreateAppointmentDto,
    therapist: Therapist,
  ) {
    const service = dto.service?.trim();
    if (service === 'Couple Therapy' && !therapist.couplePrice) {
      throw new BadRequestException(
        'Couple therapy is not offered by this therapist',
      );
    }
    const mode = dto.mode?.trim();
    const supportedModes = getSupportedBookingModes(therapist.consultationType);
    if (!mode || !supportedModes.includes(mode)) {
      throw new BadRequestException(
        'The selected session mode is not offered by this therapist',
      );
    }
    const baseAmount =
      service === 'Couple Therapy'
        ? (therapist.couplePrice as number)
        : therapist.price;
    const pricing = calculateSessionPackagePricing(
      baseAmount,
      dto.sessionCount ?? 1,
    );

    if (!pricing) {
      throw new BadRequestException('Unsupported session package selected');
    }

    return pricing;
  }

  private async resolveQuickBookingPatient(
    dto: CreateAppointmentDto,
    manager: EntityManager,
  ): Promise<{ patient: User; createdAccount: boolean }> {
    const email = this.normalizeEmail(dto.contactEmail);
    const phone = this.normalizePhone(dto.contactPhone);

    if (!email) {
      throw new BadRequestException('Please enter and verify your email');
    }

    const userRepo = manager.getRepository(User);
    const query = userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: Role.PATIENT });

    if (phone) {
      query.andWhere(
        "(user.email = :email OR regexp_replace(COALESCE(user.phone, ''), '\\D', '', 'g') = :phone)",
        { email, phone },
      );
    } else {
      query.andWhere('user.email = :email', { email });
    }

    const existingPatients = await query.getMany();
    const patient =
      existingPatients.find((user) => email && user.email === email) ??
      existingPatients.find(
        (user) =>
          phone && this.normalizePhone(user.phone ?? undefined) === phone,
      );

    if (patient) {
      throw new ConflictException(
        'A patient account already uses this email or phone. Sign in before booking.',
      );
    }

    const password = await bcrypt.hash(randomBytes(24).toString('hex'), 10);
    const createdPatient = userRepo.create({
      email,
      password,
      role: Role.PATIENT,
      fullName: dto.contactName?.trim() || null,
      phone: phone || null,
      age: null,
      gender: null,
      healthInfo: null,
    });

    return {
      patient: await userRepo.save(createdPatient),
      createdAccount: true,
    };
  }

  private normalizeEmail(email?: string) {
    const normalized = email?.trim().toLowerCase();
    return normalized || null;
  }

  private normalizePhone(phone?: string) {
    const digits = phone?.replace(/\D/g, '');
    return digits || null;
  }

  async notifyBookingAfterPayment(
    appointment: Appointment,
    email?: string | null,
  ) {
    try {
      const hydratedAppointment =
        appointment.slot && appointment.therapist && appointment.patient
          ? appointment
          : ((await this.appointmentRepo.findOne({
              where: { id: appointment.id },
              relations: {
                slot: true,
                therapist: true,
                patient: true,
              },
            })) ?? appointment);
      if (!hydratedAppointment.slot || !hydratedAppointment.therapist) {
        this.logger.error(
          JSON.stringify({
            event: 'booking_notification_relations_missing',
            appointmentId: appointment.id,
          }),
        );
        return;
      }
      const results = await Promise.allSettled([
        this.sendBookingNotifications(
          hydratedAppointment,
          this.normalizeEmail(
            email ??
              hydratedAppointment.contactEmail ??
              hydratedAppointment.patient?.email,
          ) ?? null,
        ),
        this.sendBookingInAppNotifications(hydratedAppointment),
      ]);
      const failures = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected',
      );
      if (failures.length) {
        this.logger.error(
          JSON.stringify({
            event: 'booking_notification_enqueue_failed',
            appointmentId: hydratedAppointment.id,
            failures: failures.map((result) =>
              result.reason instanceof Error
                ? result.reason.message
                : 'Unknown notification error',
            ),
          }),
        );
      }
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: 'booking_notification_failed',
          appointmentId: appointment.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    }
  }

  private async sendBookingNotifications(
    appointment: Appointment,
    email: string | null,
  ) {
    const slotRange = formatIstSlotRange(
      appointment.slot.startTime,
      appointment.slot.endTime,
    );
    const service = appointment.service ?? 'Therapy session';
    const payableAmount =
      appointment.packageOfferAmount > 0
        ? appointment.packageOfferAmount
        : appointment.service === 'Couple Therapy'
          ? (appointment.therapist.couplePrice ?? appointment.therapist.price)
          : appointment.therapist.price;
    const policyUrl = `${businessConfig.website}/service-delivery-policy`;

    if (email) {
      await this.providerJobService.enqueueEmail(
        {
          to: email,
          subject: `${businessConfig.brandName} booking and payment received`,
          text: [
            `Your ${businessConfig.brandName} booking and payment have been received.`,
            `Booking reference: ${appointment.id}`,
            `Service: ${service}`,
            `Therapist: ${appointment.therapist.name}`,
            `Slot: ${slotRange}`,
            `Amount paid: INR ${payableAmount}`,
            'Payment status: Paid',
            'Staff will confirm the appointment and send joining instructions.',
            `Service delivery, cancellation, and refund information: ${policyUrl}`,
            `Support: ${businessConfig.emails.support} | ${businessConfig.supportPhone.display}`,
          ].join('\n'),
          html: `
          <p>Your ${businessConfig.brandName} booking and payment have been received.</p>
          <p><strong>Booking reference:</strong> ${appointment.id}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Therapist:</strong> ${appointment.therapist.name}</p>
          <p><strong>Slot:</strong> ${slotRange}</p>
          <p><strong>Amount paid:</strong> INR ${payableAmount}</p>
          <p><strong>Payment status:</strong> Paid</p>
          <p>Staff will confirm the appointment and send joining instructions.</p>
          <p><a href="${policyUrl}">Service delivery, cancellation, and refund information</a></p>
          <p>Support: ${businessConfig.emails.support} · ${businessConfig.supportPhone.display}</p>
        `,
        },
        { deduplicationKey: `appointment:${appointment.id}:request:email` },
      );
    }
  }

  private async sendBookingInAppNotifications(appointment: Appointment) {
    const therapistAccountId = await this.getTherapistAccountId(appointment);
    const slotRange = this.formatSlotRange(appointment);
    const service = appointment.service ?? 'Therapy session';
    const patientName =
      appointment.contactName ??
      appointment.patient?.fullName ??
      appointment.patient?.email ??
      'Patient';

    await Promise.allSettled([
      this.notificationService.createMany(
        [
          appointment.patient?.id
            ? {
                recipientId: appointment.patient.id,
                type: NotificationType.APPOINTMENT,
                title: 'Appointment request received',
                body: `${service} with ${appointment.therapist.name} is booked for ${slotRange}. Our care team will confirm it and share joining instructions.`,
                actionUrl: '/profile/patient',
                metadata: { appointmentId: appointment.id },
              }
            : null,
          therapistAccountId
            ? {
                recipientId: therapistAccountId,
                type: NotificationType.APPOINTMENT,
                title: 'New appointment request',
                body: `${patientName} requested ${service} for ${slotRange}.`,
                actionUrl: '/profile/therapist',
                metadata: { appointmentId: appointment.id },
              }
            : null,
        ].filter(
          (notification): notification is NonNullable<typeof notification> =>
            Boolean(notification),
        ),
      ),
      this.notificationService.notifyAdmins({
        type: NotificationType.APPOINTMENT,
        title: 'New appointment request',
        body: `${patientName} requested ${service} with ${appointment.therapist.name}.`,
        actionUrl: '/profile/admin',
        metadata: { appointmentId: appointment.id },
      }),
    ]);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepo
      .createQueryBuilder('appointment')
      .addSelect('appointment.staffNotes')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.therapist', 'therapist')
      .leftJoinAndSelect('appointment.slot', 'slot')
      .orderBy('appointment.createdAt', 'DESC')
      .getMany();
  }

  async findForUser(user: JwtPayload): Promise<Appointment[]> {
    if (user.role === Role.ADMIN) {
      return this.findAll();
    }

    if (user.role === Role.THERAPIST) {
      return this.appointmentRepo.find({
        where: {
          therapist: {
            account: {
              id: user.userId,
            },
          },
        },
        relations: {
          patient: true,
          therapist: true,
          slot: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    }

    return this.findForPatient(user);
  }

  async findForPatient(patient: JwtPayload): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      where: {
        patient: {
          id: patient.userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['therapist.account'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async findOneForUser(id: string, user: JwtPayload): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (user.role === Role.ADMIN) {
      return appointment;
    }

    if (user.role === Role.PATIENT && appointment.patient?.id === user.userId) {
      return appointment;
    }

    if (
      user.role === Role.THERAPIST &&
      appointment.therapist?.account?.id === user.userId
    ) {
      return appointment;
    }

    throw new NotFoundException('Appointment not found');
  }

  async updateStatus(
    id: string,
    dto: UpdateAppointmentStatusDto,
    user?: JwtPayload,
  ): Promise<Appointment> {
    const appointment = user
      ? await this.findOneForUser(id, user)
      : await this.findOne(id);

    if (!canTransitionAppointmentStatus(appointment.status, dto.status)) {
      throw new BadRequestException(
        `Appointment status cannot change from ${appointment.status} to ${dto.status}`,
      );
    }

    if (appointment.status === dto.status) {
      return appointment;
    }

    if (
      dto.status === AppointmentStatus.CONFIRMED &&
      !(await this.hasPaidPayment(appointment.id))
    ) {
      throw new BadRequestException(
        'A paid appointment is required before confirmation',
      );
    }

    if (dto.status === AppointmentStatus.CANCELLED) {
      const savedAppointment = await this.persistCancellation(appointment);
      await this.sendAppointmentStatusInAppNotifications(
        savedAppointment,
        user,
      );
      return savedAppointment;
    }

    appointment.status = dto.status;

    const savedAppointment = await this.appointmentRepo.save(appointment);
    await this.sendAppointmentStatusInAppNotifications(savedAppointment, user);

    return savedAppointment;
  }

  async updateOperations(
    id: string,
    dto: UpdateAppointmentOperationsDto,
    user: JwtPayload,
  ): Promise<Appointment> {
    if (user.role !== Role.ADMIN) {
      throw new NotFoundException('Appointment not found');
    }

    const appointment = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .addSelect('appointment.staffNotes')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.therapist', 'therapist')
      .leftJoinAndSelect('therapist.account', 'therapistAccount')
      .leftJoinAndSelect('appointment.slot', 'slot')
      .where('appointment.id = :id', { id })
      .getOne();

    if (!appointment) throw new NotFoundException('Appointment not found');
    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Manual handoff cannot be changed for a closed appointment',
      );
    }

    const now = new Date();
    let meetingLinkChanged = false;
    if (dto.meetingLink !== undefined) {
      if (appointment.status !== AppointmentStatus.CONFIRMED) {
        throw new BadRequestException(
          'Confirm the paid appointment before adding a meeting link',
        );
      }
      const meetingLink = this.validateManualZoomLink(dto.meetingLink);
      meetingLinkChanged = meetingLink !== appointment.meetingLink;
      if (meetingLinkChanged) {
        appointment.meetingLink = meetingLink;
        appointment.meetingLinkAddedAt = now;
        appointment.meetingLinkSentAt = null;
        appointment.reminderSentAt = null;
      }
    }

    if (dto.markBookingConfirmationSent) {
      appointment.bookingConfirmationSentAt = now;
    }
    if (dto.markMeetingLinkSent) {
      if (!appointment.meetingLink) {
        throw new BadRequestException(
          'Add the meeting link before marking it as sent',
        );
      }
      appointment.meetingLinkSentAt = now;
    }
    if (dto.markReminderSent) {
      if (!appointment.meetingLink || !appointment.meetingLinkSentAt) {
        throw new BadRequestException(
          'Share the meeting link before recording a reminder',
        );
      }
      appointment.reminderSentAt = now;
    }
    if (dto.staffNotes !== undefined) {
      appointment.staffNotes = dto.staffNotes.trim() || null;
    }

    const savedAppointment = await this.appointmentRepo.save(appointment);
    if (meetingLinkChanged) {
      await this.sendMeetingLinkReadyNotifications(savedAppointment);
    }
    return savedAppointment;
  }

  async remove(id: string, user?: JwtPayload): Promise<Appointment> {
    const appointment = user
      ? await this.findOneForUser(id, user)
      : await this.findOne(id);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      return appointment;
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'A completed appointment cannot be cancelled',
      );
    }

    if (
      user?.role === Role.PATIENT &&
      (!appointment.createdAt ||
        !appointment.slot?.startTime ||
        !canPatientCancelAppointment(
          appointment.createdAt,
          appointment.slot.startTime,
        ))
    ) {
      throw new BadRequestException(
        'Patient cancellation is available only during the first hour after booking and before the appointment starts. Contact support for exceptional requests.',
      );
    }

    const savedAppointment = await this.persistCancellation(appointment);
    await this.sendAppointmentStatusInAppNotifications(savedAppointment, user);

    return savedAppointment;
  }

  private async persistCancellation(appointment: Appointment) {
    return this.dataSource.transaction(async (manager) => {
      if (appointment.slot?.id) {
        const slot = await manager
          .getRepository(AvailabilitySlot)
          .createQueryBuilder('slot')
          .setLock('pessimistic_write', undefined, ['slot'])
          .where('slot.id = :slotId', { slotId: appointment.slot.id })
          .getOne();

        if (slot?.status === SlotStatus.BOOKED) {
          slot.status = SlotStatus.AVAILABLE;
          await manager.getRepository(AvailabilitySlot).save(slot);
        }
      }

      appointment.status = AppointmentStatus.CANCELLED;
      appointment.meetingLink = null;
      appointment.meetingLinkAddedAt = null;
      appointment.meetingLinkSentAt = null;
      appointment.reminderSentAt = null;
      appointment.reservationExpiresAt = null;
      appointment.cancelledAt = new Date();
      appointment.cancellationReason = 'Cancelled by user or administrator';
      return manager.getRepository(Appointment).save(appointment);
    });
  }

  private async sendAppointmentStatusInAppNotifications(
    appointment: Appointment,
    actor?: JwtPayload,
  ) {
    const therapistAccountId = await this.getTherapistAccountId(appointment);
    const service = appointment.service ?? 'Therapy session';
    const slotRange = this.formatSlotRange(appointment);
    const actionUrl = '/profile/patient';
    const recipients = new Set<string>();
    if (appointment.patient?.id) recipients.add(appointment.patient.id);
    if (therapistAccountId && therapistAccountId !== actor?.userId) {
      recipients.add(therapistAccountId);
    }

    const title =
      appointment.status === AppointmentStatus.CONFIRMED
        ? 'Appointment confirmed'
        : `Appointment ${appointment.status.toLowerCase()}`;
    const body =
      appointment.status === AppointmentStatus.CONFIRMED
        ? `${service} for ${slotRange} is confirmed. Our care team is preparing your secure session link.`
        : `${service} for ${slotRange} is now ${appointment.status.toLowerCase()}.`;

    await Promise.allSettled([
      this.notificationService.createMany(
        [...recipients].map((recipientId) => ({
          recipientId,
          type: NotificationType.APPOINTMENT,
          title,
          body,
          actionUrl,
          metadata: { appointmentId: appointment.id },
        })),
      ),
      this.notificationService.notifyAdmins({
        type: NotificationType.APPOINTMENT,
        title,
        body: `${appointment.therapist.name}: ${body}`,
        actionUrl: '/profile/admin',
        metadata: { appointmentId: appointment.id },
      }),
    ]);
  }

  private async getTherapistAccountId(appointment: Appointment) {
    if (!appointment.therapist?.id) return null;

    const therapist = await this.dataSource.getRepository(Therapist).findOne({
      where: { id: appointment.therapist.id },
      relations: ['account'],
    });

    return therapist?.account?.id ?? null;
  }

  private async hasPaidPayment(appointmentId: string) {
    return this.dataSource.getRepository(Payment).exists({
      where: {
        appointment: { id: appointmentId },
        status: PaymentStatus.PAID,
      },
    });
  }

  private validateManualZoomLink(value: string) {
    const link = normalizeManualZoomLink(value);
    if (!link) {
      throw new BadRequestException(
        'Meeting links must use an official zoom.us address',
      );
    }
    return link;
  }

  private async sendMeetingLinkReadyNotifications(appointment: Appointment) {
    const therapistAccountId =
      appointment.therapist?.account?.id ??
      (await this.getTherapistAccountId(appointment));
    const service = appointment.service ?? 'Therapy session';
    const slotRange = this.formatSlotRange(appointment);
    const notifications = [
      appointment.patient?.id
        ? {
            recipientId: appointment.patient.id,
            type: NotificationType.APPOINTMENT,
            title: 'Your session link is ready',
            body: `${service} for ${slotRange} now has a secure Zoom link in your appointment dashboard.`,
            actionUrl: '/profile/patient',
            metadata: { appointmentId: appointment.id },
          }
        : null,
      therapistAccountId
        ? {
            recipientId: therapistAccountId,
            type: NotificationType.APPOINTMENT,
            title: 'Session link added by the care team',
            body: `${service} for ${slotRange} is ready to join from your dashboard.`,
            actionUrl: '/profile/therapist',
            metadata: { appointmentId: appointment.id },
          }
        : null,
    ].filter((notification): notification is NonNullable<typeof notification> =>
      Boolean(notification),
    );

    await this.notificationService.createMany(notifications);
  }

  private formatSlotRange(appointment: Appointment) {
    if (!appointment.slot?.startTime || !appointment.slot?.endTime) {
      return 'the selected slot';
    }

    return formatIstSlotRange(
      appointment.slot.startTime,
      appointment.slot.endTime,
    );
  }

  private getReservationTtlMinutes() {
    const configured = Number(
      this.configService.get<string>('UNPAID_RESERVATION_TTL_MINUTES', '15'),
    );
    return Number.isFinite(configured) && configured > 0 ? configured : 15;
  }
}
