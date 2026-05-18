import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role, User } from '../user/entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './entities/ticket-status.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) {}

  create(dto: CreateTicketDto, user: JwtPayload) {
    const ticket = this.ticketRepo.create({
      createdBy: { id: user.userId } as User,
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      category: dto.category?.trim() || 'General',
    });

    return this.ticketRepo.save(ticket);
  }

  findForUser(user: JwtPayload) {
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
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
    if (dto.adminNote !== undefined) ticket.adminNote = dto.adminNote.trim() || null;

    return this.ticketRepo.save(ticket);
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
