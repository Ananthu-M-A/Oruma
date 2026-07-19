import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role, User } from '../user/entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './entities/ticket-status.enum';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateTicketDto, user: JwtPayload) {
    const ticket = this.ticketRepo.create({
      createdBy: { id: user.userId } as User,
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      category: dto.category?.trim() || 'General',
    });

    const savedTicket = await this.ticketRepo.save(ticket);

    await Promise.allSettled([
      this.notificationService.create({
        recipientId: user.userId,
        type: NotificationType.SUPPORT,
        title: 'Support ticket created',
        body: `Your ${savedTicket.category} ticket "${savedTicket.subject}" was created.`,
        actionUrl: '/profile/patient',
        metadata: { ticketId: savedTicket.id },
      }),
      this.notificationService.notifyAdmins({
        type: NotificationType.SUPPORT,
        title: 'New support ticket',
        body: `${user.email} created a ${savedTicket.category} ticket: ${savedTicket.subject}.`,
        actionUrl: '/profile/admin',
        metadata: { ticketId: savedTicket.id },
      }),
    ]);

    return savedTicket;
  }

  findForUser(user: JwtPayload) {
    if (user.role === Role.ADMIN) {
      return this.ticketRepo.find({ order: { createdAt: 'DESC' } });
    }

    return this.ticketRepo.find({
      where: { createdBy: { id: user.userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateTicketDto) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (dto.status) ticket.status = dto.status;
    if (dto.adminNote !== undefined)
      ticket.adminNote = dto.adminNote.trim() || null;

    const savedTicket = await this.ticketRepo.save(ticket);

    if (
      savedTicket.createdBy?.id &&
      (dto.status || dto.adminNote !== undefined)
    ) {
      const statusText = savedTicket.status.toLowerCase().replace('_', ' ');
      const noteText = savedTicket.adminNote
        ? ` Admin note: ${savedTicket.adminNote}`
        : '';

      await this.notificationService.create({
        recipientId: savedTicket.createdBy.id,
        type: NotificationType.SUPPORT,
        title: 'Support ticket updated',
        body: `Your ticket "${savedTicket.subject}" is now ${statusText}.${noteText}`,
        actionUrl: '/profile/patient',
        metadata: { ticketId: savedTicket.id },
      });
    }

    return savedTicket;
  }

  async getSummary() {
    const tickets = await this.ticketRepo.find();

    return {
      open: tickets.filter((ticket) =>
        [TicketStatus.OPEN, TicketStatus.IN_PROGRESS].includes(ticket.status),
      ).length,
      resolved: tickets.filter((ticket) =>
        [TicketStatus.RESOLVED, TicketStatus.CLOSED].includes(ticket.status),
      ).length,
    };
  }
}
