import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment } from './entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { SlotStatus } from '../availability/entities/slot-status.enum';

import { Role, User } from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { ZoomService } from '../zoom/zoom.service';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { AppointmentStatus } from './entities/appointment-status.enum';

@Injectable()
export class AppointmentService {
  private readonly quickBookingEmailDomain = 'quick-booking.oruma.local';

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(AvailabilitySlot)
    private readonly slotRepo: Repository<AvailabilitySlot>,
    private readonly mailService: MailService,
    private readonly whatsAppService: WhatsAppService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly zoomService: ZoomService,
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

    await this.sendBookingNotifications(savedAppointment, patient.email);

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

    await this.sendBookingNotifications(
      result.appointment,
      this.normalizeEmail(dto.contactEmail),
    );

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

    const existingAppointment = await appointmentRepo.findOne({
      where: {
        slot: {
          id: slot.id,
        },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('Slot already booked');
    }

    slot.status = SlotStatus.BOOKED;
    await slotRepo.save(slot);

    const appointment = appointmentRepo.create({
      patient: {
        id: patientAccount.id,
      } as User,
      therapist: slot.therapist,
      slot,
      notes: dto.notes,
      contactName: dto.contactName?.trim() || patientAccount?.fullName || null,
      contactEmail: this.normalizeEmail(dto.contactEmail) || patientAccount.email,
      contactPhone: this.normalizePhone(dto.contactPhone) || patientAccount?.phone || null,
      service: dto.service?.trim() || null,
      mode: dto.mode?.trim() || null,
    });

    return appointmentRepo.save(appointment);
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
        (user) => phone && this.normalizePhone(user.phone ?? undefined) === phone,
      );

    if (patient) {
      patient.fullName = patient.fullName || dto.contactName?.trim() || null;
      patient.phone = patient.phone || phone || null;

      if (
        email &&
        patient.email.endsWith(`@${this.quickBookingEmailDomain}`)
      ) {
        const emailOwner = await userRepo.findOne({ where: { email } });
        if (!emailOwner) patient.email = email;
      }

      return {
        patient: await userRepo.save(patient),
        createdAccount: false,
      };
    }

    const password = await bcrypt.hash(randomBytes(24).toString('hex'), 10);
    const patientEmail =
      email || `${phone}@${this.quickBookingEmailDomain}`;
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

  private async sendBookingNotifications(
    appointment: Appointment,
    email: string | null,
  ) {
    const slotRange = `${appointment.slot.startTime.toISOString()} - ${appointment.slot.endTime.toISOString()}`;
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

    if (
      user.role === Role.PATIENT &&
      appointment.patient?.id === user.userId
    ) {
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

    return savedAppointment;
  }

  async remove(id: string): Promise<{ message: string }> {
    const appointment = await this.findOne(id);

    if (appointment.slot) {
      appointment.slot.status = SlotStatus.AVAILABLE;

      await this.slotRepo.save(appointment.slot);
    }

    await this.appointmentRepo.remove(appointment);

    return {
      message: 'Appointment deleted successfully',
    };
  }

  private async sendMeetingLinkNotifications(appointment: Appointment) {
    const meetingLink = appointment.meetingLink;
    if (!meetingLink) return;

    const slotRange = `${appointment.slot.startTime.toISOString()} - ${appointment.slot.endTime.toISOString()}`;
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
}
