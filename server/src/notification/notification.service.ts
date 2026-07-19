import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role, User } from '../user/entities/user.entity';
import { Notification, NotificationType } from './entities/notification.entity';

export type CreateNotificationInput = {
  recipientId: string;
  type?: NotificationType;
  title: string;
  body: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
};

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findForUser(user: JwtPayload) {
    return this.notificationRepo.find({
      where: { recipient: { id: user.userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getUnreadCount(user: JwtPayload) {
    const count = await this.notificationRepo.count({
      where: { recipient: { id: user.userId }, readAt: IsNull() },
    });

    return { count };
  }

  async create(input: CreateNotificationInput) {
    const notification = this.notificationRepo.create({
      recipient: { id: input.recipientId } as User,
      type: input.type ?? NotificationType.SYSTEM,
      title: input.title.trim(),
      body: input.body.trim(),
      actionUrl: input.actionUrl ?? null,
      metadata: input.metadata ?? null,
    });

    return this.notificationRepo.save(notification);
  }

  async createMany(inputs: CreateNotificationInput[]) {
    if (inputs.length === 0) return [];

    const notifications = inputs.map((input) =>
      this.notificationRepo.create({
        recipient: { id: input.recipientId } as User,
        type: input.type ?? NotificationType.SYSTEM,
        title: input.title.trim(),
        body: input.body.trim(),
        actionUrl: input.actionUrl ?? null,
        metadata: input.metadata ?? null,
      }),
    );

    return this.notificationRepo.save(notifications);
  }

  async notifyAdmins(input: Omit<CreateNotificationInput, 'recipientId'>) {
    const admins = await this.userRepo.find({
      where: { role: Role.ADMIN },
      select: ['id'],
    });

    return this.createMany(
      admins.map((admin) => ({
        ...input,
        recipientId: admin.id,
      })),
    );
  }

  async markRead(id: string, user: JwtPayload) {
    const notification = await this.notificationRepo.findOne({
      where: {
        id,
        recipient: {
          id: user.userId,
        },
      },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    notification.readAt = notification.readAt ?? new Date();

    return this.notificationRepo.save(notification);
  }

  async markAllRead(user: JwtPayload) {
    const unread = await this.notificationRepo.find({
      where: {
        recipient: {
          id: user.userId,
        },
        readAt: IsNull(),
      },
    });

    if (unread.length === 0) return { updated: 0 };

    const now = new Date();
    unread.forEach((notification) => {
      notification.readAt = now;
    });

    await this.notificationRepo.save(unread);

    return { updated: unread.length };
  }
}
