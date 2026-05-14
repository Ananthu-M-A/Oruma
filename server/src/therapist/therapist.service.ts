import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AppointmentStatus } from '../appointment/entities/appointment-status.enum';
import { MailService } from '../mail/mail.service';
import { Role } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Therapist } from './entities/therapist.entity';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';

type TherapistPerformance = {
  therapistId: string;
  therapistName: string;
  email: string;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionRate: number;
  estimatedCompletedRevenue: number;
};

@Injectable()
export class TherapistService {
  constructor(
    @InjectRepository(Therapist)
    private readonly therapistRepo: Repository<Therapist>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreateTherapistDto,
  ): Promise<Therapist & { credentialsSent: boolean }> {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const account = await this.userService.create({
      email,
      password: hashedPassword,
      role: Role.THERAPIST,
    });

    const therapist = this.therapistRepo.create({
      ...dto,
      email,
      name: dto.name?.trim() || email.split('@')[0],
      title: dto.title?.trim() || 'Therapist',
      experience: dto.experience ?? 0,
      group: dto.group ?? 1,
      price: dto.price ?? 0,
      isActive: false,
      account,
    });

    const savedTherapist = await this.therapistRepo.save(therapist);
    const credentialsSent = await this.sendTherapistCredentials(
      savedTherapist,
      temporaryPassword,
    );

    return {
      ...savedTherapist,
      credentialsSent,
    };
  }

  findAll(): Promise<Therapist[]> {
    return this.therapistRepo.find({
      where: {
        isActive: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findAllForAdmin(): Promise<Therapist[]> {
    return this.therapistRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Therapist> {
    const therapist = await this.therapistRepo.findOne({
      where: { id },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    return therapist;
  }

  async update(id: string, dto: UpdateTherapistDto): Promise<Therapist> {
    const therapist = await this.findOneWithAccount(id);
    const email = dto.email?.trim().toLowerCase();

    if (email && email !== therapist.email) {
      const existingUser = await this.userService.findByEmail(email);

      if (existingUser && existingUser.id !== therapist.account?.id) {
        throw new ConflictException('Email is already registered');
      }

      if (therapist.account) {
        await this.userService.updateEmail(therapist.account.id, email);
      }

      therapist.email = email;
    }

    Object.assign(therapist, {
      ...dto,
      email: email ?? therapist.email,
    });

    return this.therapistRepo.save(therapist);
  }

  async findForTherapistAccount(user: JwtPayload): Promise<Therapist> {
    const therapist = await this.therapistRepo.findOne({
      where: {
        account: {
          id: user.userId,
        },
      },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist profile not found');
    }

    return therapist;
  }

  async updateOwnProfile(
    user: JwtPayload,
    dto: UpdateTherapistDto,
  ): Promise<Therapist> {
    const therapist = await this.findForTherapistAccount(user);
    const { email, isActive, ...profileUpdates } = dto;

    void email;
    void isActive;
    therapist.pendingProfileChanges = this.removeEmptyProfileChanges(
      profileUpdates as Record<string, unknown>,
    );
    therapist.pendingProfileSubmittedAt = new Date();

    return this.therapistRepo.save(therapist);
  }

  async approveProfileChanges(id: string): Promise<Therapist> {
    const therapist = await this.findOne(id);

    if (!therapist.pendingProfileChanges) {
      throw new BadRequestException('No pending profile changes to approve');
    }

    Object.assign(therapist, therapist.pendingProfileChanges);
    therapist.pendingProfileChanges = null;
    therapist.pendingProfileSubmittedAt = null;

    return this.therapistRepo.save(therapist);
  }

  async rejectProfileChanges(id: string): Promise<Therapist> {
    const therapist = await this.findOne(id);

    if (!therapist.pendingProfileChanges) {
      throw new BadRequestException('No pending profile changes to reject');
    }

    therapist.pendingProfileChanges = null;
    therapist.pendingProfileSubmittedAt = null;

    return this.therapistRepo.save(therapist);
  }

  async remove(id: string): Promise<{ message: string }> {
    const therapist = await this.findOne(id);

    await this.therapistRepo.remove(therapist);

    return {
      message: 'Therapist deleted successfully',
    };
  }

  async getPerformance(): Promise<TherapistPerformance[]> {
    const therapists = await this.therapistRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
    const appointments = await this.appointmentRepo.find();

    return therapists.map((therapist) => {
      const therapistAppointments = appointments.filter(
        (appointment) => appointment.therapist?.id === therapist.id,
      );
      const totalAppointments = therapistAppointments.length;
      const completedAppointments = therapistAppointments.filter(
        (appointment) => appointment.status === AppointmentStatus.COMPLETED,
      ).length;

      return {
        therapistId: therapist.id,
        therapistName: therapist.name,
        email: therapist.email ?? '',
        totalAppointments,
        pendingAppointments: therapistAppointments.filter(
          (appointment) => appointment.status === AppointmentStatus.PENDING,
        ).length,
        confirmedAppointments: therapistAppointments.filter(
          (appointment) => appointment.status === AppointmentStatus.CONFIRMED,
        ).length,
        completedAppointments,
        cancelledAppointments: therapistAppointments.filter(
          (appointment) => appointment.status === AppointmentStatus.CANCELLED,
        ).length,
        completionRate:
          totalAppointments === 0
            ? 0
            : Math.round((completedAppointments / totalAppointments) * 100),
        estimatedCompletedRevenue: completedAppointments * therapist.price,
      };
    });
  }

  private generateTemporaryPassword() {
    return `Oruma-${randomBytes(6).toString('base64url')}`;
  }

  private removeEmptyProfileChanges(changes: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value !== undefined),
    );
  }

  private async findOneWithAccount(id: string): Promise<Therapist> {
    const therapist = await this.therapistRepo.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    return therapist;
  }

  private sendTherapistCredentials(
    therapist: Therapist,
    temporaryPassword: string,
  ) {
    const loginUrl = this.configService.get<string>(
      'CLIENT_LOGIN_URL',
      'http://localhost:5173/login',
    );
    const subject = 'Your Oruma therapist account is ready';
    const text = [
      `Hello ${therapist.name},`,
      '',
      'Your Oruma therapist account has been created.',
      `Login: ${loginUrl}`,
      `Email: ${therapist.email}`,
      `Temporary password: ${temporaryPassword}`,
      '',
      'Please sign in and keep these credentials secure.',
    ].join('\n');

    return this.mailService.send({
      to: therapist.email ?? '',
      subject,
      text,
      html: `
        <p>Hello ${therapist.name},</p>
        <p>Your Oruma therapist account has been created.</p>
        <p><strong>Login:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Email:</strong> ${therapist.email}</p>
        <p><strong>Temporary password:</strong> ${temporaryPassword}</p>
        <p>Please sign in and keep these credentials secure.</p>
      `,
    });
  }
}
