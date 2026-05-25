import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment } from './entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { SlotStatus } from '../availability/entities/slot-status.enum';

import { Role, User } from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(AvailabilitySlot)
    private readonly slotRepo: Repository<AvailabilitySlot>,
    private readonly mailService: MailService,
    private readonly whatsAppService: WhatsAppService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateAppointmentDto,
    patient: JwtPayload,
  ): Promise<Appointment> {
    const savedAppointment = await this.dataSource.transaction(
      async (manager) => {
        const slotRepo = manager.getRepository(AvailabilitySlot);
        const appointmentRepo = manager.getRepository(Appointment);
        const userRepo = manager.getRepository(User);

        const slot = await slotRepo
          .createQueryBuilder('slot')
          .setLock('pessimistic_write')
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

        const patientAccount = await userRepo.findOne({
          where: {
            id: patient.userId,
          },
        });

        slot.status = SlotStatus.BOOKED;
        await slotRepo.save(slot);

        const appointment = appointmentRepo.create({
          patient: {
            id: patient.userId,
          } as User,
          therapist: slot.therapist,
          slot,
          notes: dto.notes,
          contactName: dto.contactName?.trim() || patientAccount?.fullName || null,
          contactEmail: dto.contactEmail?.trim().toLowerCase() || patient.email,
          contactPhone: dto.contactPhone?.trim() || patientAccount?.phone || null,
          service: dto.service?.trim() || null,
          mode: dto.mode?.trim() || null,
        });

        return appointmentRepo.save(appointment);
      },
    );

    await this.sendBookingNotifications(savedAppointment, patient);

    return savedAppointment;
  }

  private async sendBookingNotifications(
    appointment: Appointment,
    patient: JwtPayload,
  ) {
    const slotRange = `${appointment.slot.startTime.toISOString()} - ${appointment.slot.endTime.toISOString()}`;
    const service = appointment.service ?? 'Therapy session';

    await this.mailService.send({
      to: patient.email,
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
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
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

    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
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

    return this.appointmentRepo.save(appointment);
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
}
