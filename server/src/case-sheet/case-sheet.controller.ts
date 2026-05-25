import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '../user/entities/user.entity';
import { UpsertCaseSheetDto } from './dto/upsert-case-sheet.dto';
import { CaseSheetService } from './case-sheet.service';

@Controller('case-sheets')
@UseGuards(JwtAuthGuard)
export class CaseSheetController {
  constructor(private readonly caseSheetService: CaseSheetService) {}

  @Get()
  findMine(@Req() req: { user: JwtPayload }) {
    return this.caseSheetService.findForUser(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    return this.caseSheetService.findOne(id, req.user);
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  upsert(@Body() dto: UpsertCaseSheetDto, @Req() req: { user: JwtPayload }) {
    return this.caseSheetService.upsert(dto, req.user);
  }
}
