import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
import { MailService } from '../mail/mail.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { ZoomService } from '../zoom/zoom.service';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { Therapist } from '../therapist/entities/therapist.entity';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { AppointmentStatus } from './entities/appointment-status.enum';
import { calculateSessionPackagePricing } from './session-package-pricing';
import { canPatientCancelAppointment } from './appointment-policy';
import { formatIstSlotRange } from '../common/ist-date-time';
import { isStartTimeBookable } from './booking-lead-time';

@Injectable()
export class AppointmentService {
  private readonly quickBookingEmailDomain = 'quick-booking.oruma.local';

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    private readonly mailService: MailService,
    private readonly whatsAppService: WhatsAppService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly zoomService: ZoomService,
    private readonly notificationService: NotificationService,
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
      .where('slot.id = :slotId', { slotId: dto.slotId })
      .getOne();

    if (!slot) {
      throw new NotFoundException('Slot not found');
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
      throw new BadRequestException('Slot already booked');
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
    });

    return appointmentRepo.save(appointment);
  }

  private resolvePackagePricing(
    dto: CreateAppointmentDto,
    therapist: Therapist,
  ) {
    const service = dto.service?.trim();
    const baseAmount =
      service === 'Couple Therapy' && therapist.couplePrice
        ? therapist.couplePrice
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

    if (!email && !phone) {
      throw new BadRequestException('Please enter an email or WhatsApp number');
    }

    const userRepo = manager.getRepository(User);
    const query = userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: Role.PATIENT });

    if (email && phone) {
      query.andWhere(
        "(user.email = :email OR regexp_replace(COALESCE(user.phone, ''), '\\D', '', 'g') = :phone)",
        { email, phone },
      );
    } else if (email) {
      query.andWhere('user.email = :email', { email });
    } else {
      query.andWhere(
        "regexp_replace(COALESCE(user.phone, ''), '\\D', '', 'g') = :phone",
        { phone },
      );
    }

    const existingPatients = await query.getMany();
    const patient =
      existingPatients.find((user) => email && user.email === email) ??
      existingPatients.find(
        (user) =>
          phone && this.normalizePhone(user.phone ?? undefined) === phone,
      );

    if (patient) {
      patient.fullName = patient.fullName || dto.contactName?.trim() || null;
      patient.phone = patient.phone || phone || null;

      if (email && patient.email.endsWith(`@${this.quickBookingEmailDomain}`)) {
        const emailOwner = await userRepo.findOne({ where: { email } });
        if (!emailOwner) patient.email = email;
      }

      return {
        patient: await userRepo.save(patient),
        createdAccount: false,
      };
    }

    const password = await bcrypt.hash(randomBytes(24).toString('hex'), 10);
    const patientEmail = email || `${phone}@${this.quickBookingEmailDomain}`;
    const createdPatient = userRepo.create({
      email: patientEmail,
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
    await this.sendBookingNotifications(
      appointment,
      this.normalizeEmail(
        email ?? appointment.contactEmail ?? appointment.patient?.email,
      ) ?? null,
    );
    await this.sendBookingInAppNotifications(appointment);
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

    if (email) {
      await this.mailService.send({
        to: email,
        subject: 'Your Oruma appointment request is received',
        text: [
          'Your Oruma appointment request has been received.',
          `Service: ${service}`,
          `Therapist: ${appointment.therapist.name}`,
          `Slot: ${slotRange}`,
          'We will keep you updated on the confirmation status.',
        ].join('\n'),
        html: `
          <p>Your Oruma appointment request has been received.</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Therapist:</strong> ${appointment.therapist.name}</p>
          <p><strong>Slot:</strong> ${slotRange}</p>
          <p>We will keep you updated on the confirmation status.</p>
        `,
      });
    }

    const whatsAppText = [
      'Your Oruma appointment request has been received.',
      `Service: ${service}`,
      `Therapist: ${appointment.therapist.name}`,
      `Slot: ${slotRange}`,
      'We will keep you updated on the confirmation status.',
    ].join('\n');

    await this.whatsAppService.send({
      to: appointment.contactPhone,
      text: whatsAppText,
      templateParameters: [service, appointment.therapist.name, slotRange],
    });
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
                body: `${service} with ${appointment.therapist.name} is pending confirmation for ${slotRange}.`,
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
    return this.appointmentRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
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

    if (
      appointment.status === AppointmentStatus.CANCELLED &&
      dto.status !== AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'A cancelled appointment cannot be reopened. Book the available slot again instead.',
      );
    }

    if (
      dto.status === AppointmentStatus.CANCELLED &&
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'A completed appointment cannot be cancelled',
      );
    }

    if (appointment.status === dto.status) return appointment;

    if (dto.status === AppointmentStatus.CANCELLED) {
      const savedAppointment = await this.persistCancellation(appointment);
      await this.sendAppointmentStatusInAppNotifications(
        savedAppointment,
        user,
      );
      return savedAppointment;
    }

    appointment.status = dto.status;

    const shouldCreateMeeting =
      dto.status === AppointmentStatus.CONFIRMED && !appointment.meetingLink;

    if (shouldCreateMeeting) {
      const meetingLink =
        await this.zoomService.createAppointmentMeeting(appointment);

      if (meetingLink) {
        appointment.meetingLink = meetingLink;
      }
    }

    const savedAppointment = await this.appointmentRepo.save(appointment);

    if (shouldCreateMeeting && savedAppointment.meetingLink) {
      await this.sendMeetingLinkNotifications(savedAppointment);
    }
    await this.sendAppointmentStatusInAppNotifications(savedAppointment, user);

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
          .setLock('pessimistic_write')
          .where('slot.id = :slotId', { slotId: appointment.slot.id })
          .getOne();

        if (slot?.status === SlotStatus.BOOKED) {
          slot.status = SlotStatus.AVAILABLE;
          await manager.getRepository(AvailabilitySlot).save(slot);
        }
      }

      appointment.status = AppointmentStatus.CANCELLED;
      appointment.meetingLink = null;
      return manager.getRepository(Appointment).save(appointment);
    });
  }

  private async sendMeetingLinkNotifications(appointment: Appointment) {
    const meetingLink = appointment.meetingLink;
    if (!meetingLink) return;

    const slotRange = formatIstSlotRange(
      appointment.slot.startTime,
      appointment.slot.endTime,
    );
    const service = appointment.service ?? 'Therapy session';
    const patientEmail = appointment.contactEmail ?? appointment.patient?.email;
    const patientName =
      appointment.contactName ??
      appointment.patient?.fullName ??
      appointment.patient?.email ??
      'Patient';

    const messageLines = [
      'Your Oruma appointment has been confirmed.',
      `Service: ${service}`,
      `Therapist: ${appointment.therapist.name}`,
      `Slot: ${slotRange}`,
      `Join Zoom session: ${meetingLink}`,
    ];

    if (patientEmail) {
      await this.mailService.send({
        to: patientEmail,
        subject: 'Your Oruma Zoom session link',
        text: messageLines.join('\n'),
        html: `
          <p>Your Oruma appointment has been confirmed.</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Therapist:</strong> ${appointment.therapist.name}</p>
          <p><strong>Slot:</strong> ${slotRange}</p>
          <p><a href="${meetingLink}">Join Zoom session</a></p>
        `,
      });
    }

    if (appointment.therapist.email) {
      await this.mailService.send({
        to: appointment.therapist.email,
        subject: 'Confirmed Oruma appointment Zoom link',
        text: [
          'An Oruma appointment has been confirmed.',
          `Patient: ${patientName}`,
          `Service: ${service}`,
          `Slot: ${slotRange}`,
          `Join Zoom session: ${meetingLink}`,
        ].join('\n'),
        html: `
          <p>An Oruma appointment has been confirmed.</p>
          <p><strong>Patient:</strong> ${patientName}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Slot:</strong> ${slotRange}</p>
          <p><a href="${meetingLink}">Join Zoom session</a></p>
        `,
      });
    }

    await this.whatsAppService.send({
      to: appointment.contactPhone,
      text: messageLines.join('\n'),
    });
  }

  private async sendAppointmentStatusInAppNotifications(
    appointment: Appointment,
    actor?: JwtPayload,
  ) {
    const therapistAccountId = await this.getTherapistAccountId(appointment);
    const service = appointment.service ?? 'Therapy session';
    const slotRange = this.formatSlotRange(appointment);
    const actionUrl =
      appointment.status === AppointmentStatus.CONFIRMED &&
      appointment.meetingLink
        ? '/profile/patient'
        : '/profile/patient';
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
      appointment.status === AppointmentStatus.CONFIRMED &&
      appointment.meetingLink
        ? `${service} for ${slotRange} is confirmed. The Zoom link is ready.`
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

  private formatSlotRange(appointment: Appointment) {
    if (!appointment.slot?.startTime || !appointment.slot?.endTime) {
      return 'the selected slot';
    }

    return formatIstSlotRange(
      appointment.slot.startTime,
      appointment.slot.endTime,
    );
  }
}
