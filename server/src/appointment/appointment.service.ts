import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment } from './entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { SlotStatus } from '../availability/entities/slot-status.enum';

import { User } from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';

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
  ) {}

  async create(
    dto: CreateAppointmentDto,
    patient: JwtPayload,
  ): Promise<Appointment> {
    const slot = await this.slotRepo.findOne({
      where: {
        id: dto.slotId,
      },
      relations: ['therapist'],
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new BadRequestException('Selected slot is unavailable');
    }

    const existingAppointment = await this.appointmentRepo.findOne({
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

    await this.slotRepo.save(slot);

    const appointment = this.appointmentRepo.create({
      patient: {
        id: patient.userId,
      } as User,
      therapist: slot.therapist,
      slot,
      notes: dto.notes,
    });

    const savedAppointment = await this.appointmentRepo.save(appointment);

    await this.mailService.send({
      to: patient.email,
      subject: 'Your Oruma appointment request is received',
      text: [
        'Your Oruma appointment request has been received.',
        `Therapist: ${slot.therapist.name}`,
        `Slot: ${slot.startTime.toISOString()} - ${slot.endTime.toISOString()}`,
        'We will keep you updated on the confirmation status.',
      ].join('\n'),
      html: `
        <p>Your Oruma appointment request has been received.</p>
        <p><strong>Therapist:</strong> ${slot.therapist.name}</p>
        <p><strong>Slot:</strong> ${slot.startTime.toISOString()} - ${slot.endTime.toISOString()}</p>
        <p>We will keep you updated on the confirmation status.</p>
      `,
    });

    return savedAppointment;
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
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
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async updateStatus(
    id: string,
    dto: UpdateAppointmentStatusDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

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
