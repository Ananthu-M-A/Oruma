import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AppointmentStatus } from '../appointment/entities/appointment-status.enum';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { SlotStatus } from '../availability/entities/slot-status.enum';
import { Role, User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { Therapist } from './entities/therapist.entity';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';
import { getEarliestBookableStartTime } from '../appointment/booking-lead-time';
import { ProviderJobService } from '../reliability/provider-job.service';
import { TherapistVerificationStatus } from './entities/therapist-verification-status.enum';
import {
  requiresProfessionalRegistration,
  splitLegacyTherapistTags,
} from './therapist-profile.constants';
import { MediaService } from '../media/media.service';

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
  | 'areasOfPractice'
  | 'languages'
  | 'experience'
  | 'price'
  | 'couplePrice'
  | 'image'
  | 'voiceIntro'
  | 'voiceIntroTranscript'
  | 'qualifications'
  | 'awardingInstitution'
  | 'specialization'
  | 'consultationType'
  | 'verifiedExperienceHours'
  | 'professionalRegistrationNumber'
  | 'registrationAuthority'
  | 'sessionDurationMinutes'
  | 'engagementRelationship'
  | 'verificationStatus'
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
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly providerJobService: ProviderJobService,
    private readonly mediaService: MediaService,
  ) {}

  async create(
    dto: CreateTherapistDto,
  ): Promise<Therapist & { credentialsQueued: boolean }> {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    let savedTherapist: Therapist;
    try {
      savedTherapist = await this.dataSource.transaction(async (manager) => {
        const userRepo = manager.getRepository(User);
        const therapistRepo = manager.getRepository(Therapist);
        const account = await userRepo.save(
          userRepo.create({
            email,
            password: hashedPassword,
            role: Role.THERAPIST,
            mustChangePassword: true,
          }),
        );
        const legacyTags = splitLegacyTherapistTags(dto.tags);
        const therapist = therapistRepo.create({
          ...dto,
          email,
          name: dto.name?.trim() || email.split('@')[0],
          title: dto.title?.trim() || 'Therapist',
          tags: this.normalizeList(dto.tags),
          areasOfPractice: this.normalizeList(
            dto.areasOfPractice ?? legacyTags.areasOfPractice,
          ),
          languages: this.normalizeList(dto.languages ?? legacyTags.languages),
          experience: dto.experience ?? 0,
          group: 1,
          price: dto.price ?? 0,
          verificationStatus: TherapistVerificationStatus.UNVERIFIED,
          isActive: false,
          account,
        });
        this.assertSafeMedia(therapist);

        return therapistRepo.save(therapist);
      });
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
    let credentialsQueued = false;
    try {
      credentialsQueued = await this.sendTherapistCredentials(
        savedTherapist,
        email,
        temporaryPassword,
      );
    } catch {
      credentialsQueued = false;
    }
    if (savedTherapist.account?.id) {
      await this.notificationService
        .create({
          recipientId: savedTherapist.account.id,
          type: NotificationType.PROFILE,
          title: 'Therapist account created',
          body: 'Your Oruma therapist account is ready. Change your temporary password and complete your profile to begin onboarding.',
          actionUrl: '/profile/therapist?tab=account',
          metadata: { therapistId: savedTherapist.id },
        })
        .catch(() => undefined);
    }

    return {
      ...savedTherapist,
      credentialsQueued,
    };
  }

  async findAll(): Promise<PublicTherapist[]> {
    const therapists = await this.therapistRepo.find({
      where: {
        isActive: true,
        verificationStatus: TherapistVerificationStatus.VERIFIED,
        archivedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const therapistsWithAvailability =
      await this.attachNextAvailableSlots(therapists);

    return therapistsWithAvailability
      .sort((a, b) => {
        if (a.nextAvailableSlot && b.nextAvailableSlot) {
          return a.nextAvailableSlot.getTime() - b.nextAvailableSlot.getTime();
        }
        if (a.nextAvailableSlot) return -1;
        if (b.nextAvailableSlot) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((therapist) => this.toPublicTherapist(therapist));
  }

  findAllForAdmin(): Promise<Therapist[]> {
    return this.adminTherapistQuery()
      .orderBy('therapist.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<PublicTherapist> {
    const therapist = await this.therapistRepo.findOne({
      where: {
        id,
        isActive: true,
        verificationStatus: TherapistVerificationStatus.VERIFIED,
        archivedAt: IsNull(),
      },
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
      therapist.email = email;
    }

    const normalizedUpdates = this.normalizeProfileChanges(dto);
    const candidate = {
      ...therapist,
      ...normalizedUpdates,
      email: email ?? therapist.email,
    };

    if (dto.isActive === true && therapist.pendingProfileChanges) {
      throw new BadRequestException(
        'Review or reject the pending profile changes before publishing',
      );
    }
    if (
      candidate.isActive ||
      candidate.verificationStatus === TherapistVerificationStatus.VERIFIED
    ) {
      this.assertReadyForPublication(candidate);
    }

    const previousImagePublicId = therapist.imagePublicId;
    const previousVoiceIntroPublicId = therapist.voiceIntroPublicId;
    Object.assign(therapist, candidate);
    this.assertSafeMedia(therapist);

    const saved = await this.dataSource.transaction(async (manager) => {
      if (email && therapist.account?.id) {
        await manager.getRepository(User).update(therapist.account.id, {
          email,
        });
      }
      return manager.getRepository(Therapist).save(therapist);
    });
    await this.deleteReplacedMedia(
      previousImagePublicId,
      saved.imagePublicId,
      previousVoiceIntroPublicId,
      saved.voiceIntroPublicId,
    );
    return saved;
  }

  async findForTherapistAccount(user: JwtPayload): Promise<Therapist> {
    const therapist = await this.adminTherapistQuery()
      .leftJoinAndSelect('therapist.account', 'account')
      .where('account.id = :userId', { userId: user.userId })
      .getOne();

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
    const previousPendingImagePublicId = therapist.pendingProfileChanges
      ? this.pendingString(therapist.pendingProfileChanges, 'imagePublicId')
      : null;
    const previousPendingVoiceIntroPublicId = therapist.pendingProfileChanges
      ? this.pendingString(
          therapist.pendingProfileChanges,
          'voiceIntroPublicId',
        )
      : null;
    const {
      email,
      isActive,
      verificationStatus,
      verifiedExperienceHours,
      engagementRelationship,
      ...profileUpdates
    } = dto;

    void email;
    void isActive;
    void verificationStatus;
    void verifiedExperienceHours;
    void engagementRelationship;
    therapist.pendingProfileChanges =
      this.normalizeProfileChanges(profileUpdates);
    if (Object.keys(therapist.pendingProfileChanges).length === 0) {
      throw new BadRequestException('Submit at least one profile change');
    }
    this.assertSafeMedia({
      ...therapist,
      ...therapist.pendingProfileChanges,
    });
    this.assertOwnedMedia(
      {
        ...therapist,
        ...therapist.pendingProfileChanges,
      },
      user.userId,
    );
    therapist.pendingProfileSubmittedAt = new Date();
    if (!therapist.isActive) {
      therapist.verificationStatus = TherapistVerificationStatus.PENDING;
    }

    const savedTherapist = await this.therapistRepo.save(therapist);
    const nextPendingImagePublicId = this.pendingString(
      savedTherapist.pendingProfileChanges ?? {},
      'imagePublicId',
    );
    const nextPendingVoiceIntroPublicId = this.pendingString(
      savedTherapist.pendingProfileChanges ?? {},
      'voiceIntroPublicId',
    );
    await Promise.allSettled([
      previousPendingImagePublicId &&
      previousPendingImagePublicId !== nextPendingImagePublicId &&
      previousPendingImagePublicId !== savedTherapist.imagePublicId
        ? this.mediaService.delete(previousPendingImagePublicId, 'image')
        : Promise.resolve(),
      previousPendingVoiceIntroPublicId &&
      previousPendingVoiceIntroPublicId !== nextPendingVoiceIntroPublicId &&
      previousPendingVoiceIntroPublicId !== savedTherapist.voiceIntroPublicId
        ? this.mediaService.delete(previousPendingVoiceIntroPublicId, 'video')
        : Promise.resolve(),
    ]);

    await this.notificationService
      .notifyAdmins({
        type: NotificationType.PROFILE,
        title: 'Therapist profile needs review',
        body: `${savedTherapist.name} submitted profile updates for approval.`,
        actionUrl: '/profile/admin/therapists',
        metadata: { therapistId: savedTherapist.id },
      })
      .catch(() => undefined);

    return savedTherapist;
  }

  async approveProfileChanges(id: string): Promise<Therapist> {
    const therapist = await this.findOneWithAccount(id);

    if (!therapist.pendingProfileChanges) {
      throw new BadRequestException('No pending profile changes to approve');
    }

    const candidate = {
      ...therapist,
      ...therapist.pendingProfileChanges,
    };
    if (therapist.isActive) this.assertReadyForPublication(candidate);
    this.assertSafeMedia(candidate);
    const previousImagePublicId = therapist.imagePublicId;
    const previousVoiceIntroPublicId = therapist.voiceIntroPublicId;
    Object.assign(therapist, therapist.pendingProfileChanges);
    therapist.pendingProfileChanges = null;
    therapist.pendingProfileSubmittedAt = null;

    const savedTherapist = await this.therapistRepo.save(therapist);
    await this.deleteReplacedMedia(
      previousImagePublicId,
      savedTherapist.imagePublicId,
      previousVoiceIntroPublicId,
      savedTherapist.voiceIntroPublicId,
    );

    if (savedTherapist.account?.id) {
      await this.notificationService
        .create({
          recipientId: savedTherapist.account.id,
          type: NotificationType.PROFILE,
          title: 'Profile updates approved',
          body: 'Your latest therapist profile updates are now live.',
          actionUrl: '/profile/therapist',
          metadata: { therapistId: savedTherapist.id },
        })
        .catch(() => undefined);
    }

    return savedTherapist;
  }

  async rejectProfileChanges(id: string): Promise<Therapist> {
    const therapist = await this.findOneWithAccount(id);

    if (!therapist.pendingProfileChanges) {
      throw new BadRequestException('No pending profile changes to reject');
    }

    const rejectedImagePublicId = this.pendingString(
      therapist.pendingProfileChanges,
      'imagePublicId',
    );
    const rejectedVoiceIntroPublicId = this.pendingString(
      therapist.pendingProfileChanges,
      'voiceIntroPublicId',
    );
    therapist.pendingProfileChanges = null;
    therapist.pendingProfileSubmittedAt = null;
    if (!therapist.isActive) {
      therapist.verificationStatus = TherapistVerificationStatus.REJECTED;
    }

    const savedTherapist = await this.therapistRepo.save(therapist);
    await Promise.allSettled([
      rejectedImagePublicId !== therapist.imagePublicId
        ? this.mediaService.delete(rejectedImagePublicId, 'image')
        : Promise.resolve(),
      rejectedVoiceIntroPublicId !== therapist.voiceIntroPublicId
        ? this.mediaService.delete(rejectedVoiceIntroPublicId, 'video')
        : Promise.resolve(),
    ]);

    if (savedTherapist.account?.id) {
      await this.notificationService
        .create({
          recipientId: savedTherapist.account.id,
          type: NotificationType.PROFILE,
          title: 'Profile updates need changes',
          body: 'Your latest therapist profile updates were not approved. Please review and submit again.',
          actionUrl: '/profile/therapist',
          metadata: { therapistId: savedTherapist.id },
        })
        .catch(() => undefined);
    }

    return savedTherapist;
  }

  async remove(id: string): Promise<{ message: string }> {
    const therapist = await this.findOneWithAccount(id);
    const futureAppointmentCount = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .innerJoin('appointment.slot', 'slot')
      .where('appointment.therapistId = :id', { id })
      .andWhere('slot.startTime > :now', { now: new Date() })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      })
      .getCount();
    if (futureAppointmentCount > 0) {
      throw new BadRequestException(
        'This therapist has future appointments. Cancel or reassign them before archiving the account.',
      );
    }
    const abandonedImagePublicId = therapist.pendingProfileChanges
      ? this.pendingString(therapist.pendingProfileChanges, 'imagePublicId')
      : null;
    const abandonedVoiceIntroPublicId = therapist.pendingProfileChanges
      ? this.pendingString(
          therapist.pendingProfileChanges,
          'voiceIntroPublicId',
        )
      : null;
    therapist.archivedAt = therapist.archivedAt ?? new Date();
    therapist.isActive = false;
    therapist.pendingProfileChanges = null;
    therapist.pendingProfileSubmittedAt = null;
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Therapist).save(therapist);
      if (therapist.account?.id) {
        await manager.getRepository(User).update(therapist.account.id, {
          disabledAt: new Date(),
        });
      }
      await manager
        .getRepository(AvailabilitySlot)
        .createQueryBuilder()
        .update(AvailabilitySlot)
        .set({ status: SlotStatus.BLOCKED })
        .where('"therapistId" = :id', { id })
        .andWhere('status = :status', { status: SlotStatus.AVAILABLE })
        .andWhere('"startTime" >= :now', { now: new Date() })
        .execute();
    });
    await Promise.allSettled([
      abandonedImagePublicId !== therapist.imagePublicId
        ? this.mediaService.delete(abandonedImagePublicId, 'image')
        : Promise.resolve(),
      abandonedVoiceIntroPublicId !== therapist.voiceIntroPublicId
        ? this.mediaService.delete(abandonedVoiceIntroPublicId, 'video')
        : Promise.resolve(),
    ]);

    return {
      message: 'Therapist archived successfully',
    };
  }

  async restore(id: string): Promise<Therapist> {
    const therapist = await this.findOneWithAccount(id);
    therapist.archivedAt = null;
    therapist.isActive = false;
    const restored = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.getRepository(Therapist).save(therapist);
      if (saved.account?.id) {
        await manager.getRepository(User).update(saved.account.id, {
          disabledAt: null,
        });
      }
      return saved;
    });
    return restored;
  }

  async getPerformance(): Promise<TherapistPerformance[]> {
    const therapists = await this.adminTherapistQuery()
      .orderBy('therapist.createdAt', 'DESC')
      .getMany();
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

  serializePrivateProfile<T extends Therapist>(therapist: T) {
    const { account: _account, ...profile } = therapist;
    void _account;
    return profile;
  }

  private toPublicTherapist(therapist: Therapist): PublicTherapist {
    const legacyTags = splitLegacyTherapistTags(therapist.tags);
    return {
      id: therapist.id,
      name: therapist.name,
      title: therapist.title,
      tags: therapist.tags,
      areasOfPractice: therapist.areasOfPractice ?? legacyTags.areasOfPractice,
      languages: therapist.languages ?? legacyTags.languages,
      experience: therapist.experience,
      price: therapist.price,
      couplePrice: therapist.couplePrice,
      image: therapist.image,
      voiceIntro: therapist.voiceIntro,
      voiceIntroTranscript: therapist.voiceIntroTranscript,
      qualifications: therapist.qualifications,
      awardingInstitution: therapist.awardingInstitution,
      verifiedExperienceHours: therapist.verifiedExperienceHours,
      professionalRegistrationNumber: therapist.professionalRegistrationNumber,
      registrationAuthority: therapist.registrationAuthority,
      specialization: therapist.specialization,
      consultationType: therapist.consultationType,
      sessionDurationMinutes: therapist.sessionDurationMinutes,
      engagementRelationship: therapist.engagementRelationship,
      verificationStatus: therapist.verificationStatus,
      bio: therapist.bio,
      nextAvailableSlot: therapist.nextAvailableSlot,
      isActive: therapist.isActive,
      createdAt: therapist.createdAt,
    };
  }

  private normalizeProfileChanges(changes: object) {
    return Object.fromEntries(
      Object.entries(changes)
        .filter(([, value]) => value !== undefined)
        .map(([field, value]) => {
          if (Array.isArray(value)) {
            return [field, this.normalizeList(value)];
          }
          if (typeof value === 'string') {
            const trimmed = value.trim();
            return [field, trimmed || null];
          }
          return [field, value];
        }),
    );
  }

  private normalizeList(values: string[] | null | undefined) {
    if (!values) return [];
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }

  private assertReadyForPublication(therapist: Partial<Therapist>) {
    if (therapist.verificationStatus !== TherapistVerificationStatus.VERIFIED) {
      throw new BadRequestException(
        'Only a verified practitioner profile can be made public',
      );
    }

    const legacyTags = splitLegacyTherapistTags(therapist.tags);
    const requiredFields: Array<[string, unknown]> = [
      ['full name', therapist.name],
      ['exact professional role', therapist.title],
      ['qualifications', therapist.qualifications],
      ['awarding institution', therapist.awardingInstitution],
      [
        'areas of practice',
        therapist.areasOfPractice?.length ?? legacyTags.areasOfPractice.length,
      ],
      ['languages', therapist.languages?.length ?? legacyTags.languages.length],
      ['consultation type', therapist.consultationType],
      ['session duration', therapist.sessionDurationMinutes],
      ['verified experience hours', therapist.verifiedExperienceHours],
      ['engagement relationship', therapist.engagementRelationship],
      ['consultation price', therapist.price],
    ];
    if (requiresProfessionalRegistration(therapist.title)) {
      requiredFields.push(
        [
          'professional registration number',
          therapist.professionalRegistrationNumber,
        ],
        ['registration authority', therapist.registrationAuthority],
      );
    }
    const missing = requiredFields
      .filter(([, value]) => !value)
      .map(([label]) => label);

    if (missing.length > 0) {
      throw new BadRequestException(
        `Complete these practitioner profile fields before publishing: ${missing.join(', ')}`,
      );
    }
  }

  private async findOneWithAccount(id: string): Promise<Therapist> {
    const therapist = await this.adminTherapistQuery()
      .leftJoinAndSelect('therapist.account', 'account')
      .where('therapist.id = :id', { id })
      .getOne();

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    return therapist;
  }

  private adminTherapistQuery() {
    return this.therapistRepo
      .createQueryBuilder('therapist')
      .addSelect([
        'therapist.email',
        'therapist.imagePublicId',
        'therapist.voiceIntroPublicId',
        'therapist.pendingProfileChanges',
        'therapist.pendingProfileSubmittedAt',
        'therapist.archivedAt',
      ]);
  }

  private assertSafeMedia(therapist: Partial<Therapist>) {
    this.assertSafeMediaUrl(
      therapist.image,
      therapist.imagePublicId,
      'profile image',
    );
    this.assertSafeMediaUrl(
      therapist.voiceIntro,
      therapist.voiceIntroPublicId,
      'voice introduction',
    );
    this.assertMediaPublicId(
      therapist.image,
      therapist.imagePublicId,
      'profile image',
    );
    this.assertMediaPublicId(
      therapist.voiceIntro,
      therapist.voiceIntroPublicId,
      'voice introduction',
    );
  }

  private assertOwnedMedia(therapist: Partial<Therapist>, accountId: string) {
    const expectedPrefix = `oruma/therapists/${accountId}/`;
    for (const [label, publicId] of [
      ['profile image', therapist.imagePublicId],
      ['voice introduction', therapist.voiceIntroPublicId],
    ] as const) {
      if (publicId && !publicId.startsWith(expectedPrefix)) {
        throw new BadRequestException(
          `${label} was not uploaded by this therapist account`,
        );
      }
    }
  }

  private assertMediaPublicId(
    url: string | null | undefined,
    publicId: string | null | undefined,
    label: string,
  ) {
    const isCloudinaryAsset = Boolean(url?.includes('res.cloudinary.com'));
    if (isCloudinaryAsset && !publicId?.startsWith('oruma/therapists/')) {
      throw new BadRequestException(
        `${label} is missing its managed media identifier`,
      );
    }
    if (publicId && !publicId.startsWith('oruma/therapists/')) {
      throw new BadRequestException(`Invalid ${label} media identifier`);
    }
  }

  private async deleteReplacedMedia(
    previousImagePublicId: string | null | undefined,
    nextImagePublicId: string | null | undefined,
    previousVoiceIntroPublicId: string | null | undefined,
    nextVoiceIntroPublicId: string | null | undefined,
  ) {
    await Promise.allSettled([
      previousImagePublicId && previousImagePublicId !== nextImagePublicId
        ? this.mediaService.delete(previousImagePublicId, 'image')
        : Promise.resolve(),
      previousVoiceIntroPublicId &&
      previousVoiceIntroPublicId !== nextVoiceIntroPublicId
        ? this.mediaService.delete(previousVoiceIntroPublicId, 'video')
        : Promise.resolve(),
    ]);
  }

  private pendingString(
    changes: Record<string, unknown>,
    key: string,
  ): string | null {
    const value = changes[key];
    return typeof value === 'string' ? value : null;
  }

  private assertSafeMediaUrl(
    value: string | null | undefined,
    publicId: string | null | undefined,
    label: string,
  ) {
    if (!value || value.startsWith('/') || !value.includes('://')) return;
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new BadRequestException(`Invalid ${label} URL`);
    }
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const expectedPrefix = cloudName ? `/${cloudName}/` : '/';
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'res.cloudinary.com' ||
      !url.pathname.startsWith(expectedPrefix)
    ) {
      throw new BadRequestException(
        `${label} must be an Oruma-managed media asset`,
      );
    }
    if (publicId) {
      let decodedPath: string;
      try {
        decodedPath = decodeURIComponent(url.pathname);
      } catch {
        throw new BadRequestException(`Invalid ${label} URL`);
      }
      const publicIdOffset = decodedPath.lastIndexOf(`/${publicId}`);
      const suffix =
        publicIdOffset === -1
          ? null
          : decodedPath.slice(publicIdOffset + publicId.length + 1);
      if (suffix === null || (suffix !== '' && !suffix.startsWith('.'))) {
        throw new BadRequestException(
          `${label} URL does not match its managed media identifier`,
        );
      }
    }
  }

  private async sendTherapistCredentials(
    therapist: Therapist,
    email: string,
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
      `Email: ${email}`,
      `Temporary password: ${temporaryPassword}`,
      '',
      'Please sign in and change this temporary password before using your therapist dashboard.',
    ].join('\n');

    await this.providerJobService.enqueueEmail(
      {
        to: email,
        subject,
        text,
        html: `
        <p>Hello ${therapist.name},</p>
        <p>Your Oruma therapist account has been created.</p>
        <p><strong>Login:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary password:</strong> ${temporaryPassword}</p>
        <p>Please sign in and change this temporary password before using your therapist dashboard.</p>
      `,
      },
      { deduplicationKey: `therapist:${therapist.id}:credentials` },
    );
    return true;
  }
}
