import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../user/entities/user.entity';
import { AdminService } from './admin.service';
import { ProviderJobService } from '../reliability/provider-job.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly providerJobService: ProviderJobService,
  ) {}

  @Get('summary')
  getSummary() {
    return this.adminService.getDashboardSummary();
  }

  @Get('provider-deliveries')
  getProviderDeliveries() {
    return this.providerJobService.findRecent();
  }

  @Patch('provider-deliveries/:id/retry')
  retryProviderDelivery(@Param('id') id: string) {
    return this.providerJobService.retry(id);
  }
}
