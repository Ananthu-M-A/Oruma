import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findMine(@Req() req: { user: JwtPayload }) {
    return this.notificationService.findForUser(req.user);
  }

  @Get('unread-count')
  unreadCount(@Req() req: { user: JwtPayload }) {
    return this.notificationService.getUnreadCount(req.user);
  }

  @Patch('read-all')
  markAllRead(@Req() req: { user: JwtPayload }) {
    return this.notificationService.markAllRead(req.user);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    return this.notificationService.markRead(id, req.user);
  }
}
