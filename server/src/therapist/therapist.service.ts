import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AppointmentStatus } from '../appointment/entities/appointment-status.enum';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { SlotStatus } from '../availability/entities/slot-status.enum';
import { MailService } from '../mail/mail.service';
import { Role } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { Therapist } from './entities/therapist.entity';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';
import { getEarliestBookableStartTime } from '../appointment/booking-lead-time';

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

type PublicTherapist = Pick<
  Therapist,
  | 'id'
  | 'name'
  | 'title'
  | 'tags'
  | 'experience'
  | 'group'
  | 'price'
  | 'couplePrice'
  | 'image'
  | 'voiceIntro'
  | 'qualifications'
  | 'specialization'
  | 'bio'
  | 'nextAvailableSlot'
  | 'isActive'
  | 'createdAt'
>;

@Injectable()
export class TherapistService {
  constructor(
    @InjectRepository(Therapist)
    private readonly therapistRepo: Repository<Therapist>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(AvailabilitySlot)
    private readonly slotRepo: Repository<AvailabilitySlot>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
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
    if (savedTherapist.account?.id) {
      await this.notificationService.create({
        recipientId: savedTherapist.account.id,
        type: NotificationType.PROFILE,
        title: 'Therapist account created',
        body: 'Your Oruma therapist account is ready. Complete your profile to begin onboarding.',
        actionUrl: '/profile/therapist',
        metadata: { therapistId: savedTherapist.id },
      });
    }

    return {
      ...savedTherapist,
      credentialsSent,
    };
  }

  async findAll(): Promise<PublicTherapist[]> {
    const therapists = await this.therapistRepo.find({
      where: {
        isActive: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const therapistsWithAvailability =
      await this.attachNextAvailableSlots(therapists);

    return therapistsWithAvailability
      .filter((therapist) => therapist.nextAvailableSlot !== null)
      .map((therapist) => this.toPublicTherapist(therapist));
  }

  findAllForAdmin(): Promise<Therapist[]> {
    return this.therapistRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<PublicTherapist> {
    const therapist = await this.therapistRepo.findOne({
      where: { id, isActive: true },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    const [therapistWithAvailability] = await this.attachNextAvailableSlots([
      therapist,
    ]);

    return this.toPublicTherapist(therapistWithAvailability);
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
    therapist.pendingProfileChanges =
      this.removeEmptyProfileChanges(profileUpdates);
    therapist.pendingProfileSubmittedAt = new Date();

    const savedTherapist = await this.therapistRepo.save(therapist);

    await this.notificationService.notifyAdmins({
      type: NotificationType.PROFILE,
      title: 'Therapist profile needs review',
      body: `${savedTherapist.name} submitted profile updates for approval.`,
      actionUrl: '/profile/admin/therapists',
      metadata: { therapistId: savedTherapist.id },
    });

    return savedTherapist;
  }

  async approveProfileChanges(id: string): Promise<Therapist> {
    const therapist = await this.findOneWithAccount(id);

    if (!therapist.pendingProfileChanges) {
      throw new BadRequestException('No pending profile changes to approve');
    }

    Object.assign(therapist, therapist.pendingProfileChanges);
    therapist.pendingProfileChanges = null;
    therapist.pendingProfileSubmittedAt = null;

    const savedTherapist = await this.therapistRepo.save(therapist);

    if (savedTherapist.account?.id) {
      await this.notificationService.create({
        recipientId: savedTherapist.account.id,
        type: NotificationType.PROFILE,
        title: 'Profile updates approved',
        body: 'Your latest therapist profile updates are now live.',
        actionUrl: '/profile/therapist',
        metadata: { therapistId: savedTherapist.id },
      });
    }

    return savedTherapist;
  }

  async rejectProfileChanges(id: string): Promise<Therapist> {
    const therapist = await this.findOneWithAccount(id);

    if (!therapist.pendingProfileChanges) {
      throw new BadRequestException('No pending profile changes to reject');
    }

    therapist.pendingProfileChanges = null;
    therapist.pendingProfileSubmittedAt = null;

    const savedTherapist = await this.therapistRepo.save(therapist);

    if (savedTherapist.account?.id) {
      await this.notificationService.create({
        recipientId: savedTherapist.account.id,
        type: NotificationType.PROFILE,
        title: 'Profile updates need changes',
        body: 'Your latest therapist profile updates were not approved. Please review and submit again.',
        actionUrl: '/profile/therapist',
        metadata: { therapistId: savedTherapist.id },
      });
    }

    return savedTherapist;
  }

  async remove(id: string): Promise<{ message: string }> {
    const therapist = await this.findOneWithAccount(id);
    const accountId = therapist.account?.id;

    await this.therapistRepo.remove(therapist);
    if (accountId) {
      await this.userService.remove(accountId);
    }

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
        estimatedCompletedRevenue: therapistAppointments
          .filter(
            (appointment) => appointment.status === AppointmentStatus.COMPLETED,
          )
          .reduce(
            (sum, appointment) =>
              sum +
              (appointment.packageOfferAmount > 0
                ? appointment.packageOfferAmount
                : therapist.price),
            0,
          ),
      };
    });
  }

  private async attachNextAvailableSlots(therapists: Therapist[]) {
    if (therapists.length === 0) return therapists;

    const earliestBookableStartTime = getEarliestBookableStartTime();
    const slots = await this.slotRepo.find({
      where: {
        therapist: {
          id: In(therapists.map((therapist) => therapist.id)),
        },
        status: SlotStatus.AVAILABLE,
        startTime: MoreThanOrEqual(earliestBookableStartTime),
      },
      order: {
        startTime: 'ASC',
      },
    });
    const nextSlotByTherapistId = new Map<string, Date>();

    for (const slot of slots) {
      if (!nextSlotByTherapistId.has(slot.therapist.id)) {
        nextSlotByTherapistId.set(slot.therapist.id, slot.startTime);
      }
    }

    return therapists.map((therapist) => {
      therapist.nextAvailableSlot =
        nextSlotByTherapistId.get(therapist.id) ?? null;
      return therapist;
    });
  }

  private generateTemporaryPassword() {
    return `Oruma-${randomBytes(6).toString('base64url')}`;
  }

  private toPublicTherapist(therapist: Therapist): PublicTherapist {
    return {
      id: therapist.id,
      name: therapist.name,
      title: therapist.title,
      tags: therapist.tags,
      experience: therapist.experience,
      group: therapist.group,
      price: therapist.price,
      couplePrice: therapist.couplePrice,
      image: therapist.image,
      voiceIntro: therapist.voiceIntro,
      qualifications: therapist.qualifications,
      specialization: therapist.specialization,
      bio: therapist.bio,
      nextAvailableSlot: therapist.nextAvailableSlot,
      isActive: therapist.isActive,
      createdAt: therapist.createdAt,
    };
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
