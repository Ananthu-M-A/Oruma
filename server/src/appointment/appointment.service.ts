import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Therapist } from '../therapist/entities/therapist.entity';
import { User } from '../user/entities/user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(Therapist)
    private readonly therapistRepo: Repository<Therapist>,
  ) {}

  async create(
    dto: CreateAppointmentDto,
    patient: JwtPayload,
  ): Promise<Appointment> {
    const therapist = await this.therapistRepo.findOne({
      where: {
        id: dto.therapistId,
      },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    const existingAppointment = await this.appointmentRepo.findOne({
      where: {
        therapist: {
          id: therapist.id,
        },
        appointmentDate: dto.appointmentDate,
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('This slot is already booked');
    }

    const appointment = this.appointmentRepo.create({
      therapist,
      patient: {
        id: patient.userId,
      } as User,
      appointmentDate: dto.appointmentDate,
      notes: dto.notes,
    });

    return this.appointmentRepo.save(appointment);
  }

  findAll(): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      order: {
        appointmentDate: 'ASC',
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

    await this.appointmentRepo.remove(appointment);

    return {
      message: 'Appointment deleted successfully',
    };
  }
}
