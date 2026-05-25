import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentService } from '../appointment/appointment.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '../user/entities/user.entity';
import { UpsertCaseSheetDto } from './dto/upsert-case-sheet.dto';
import { CaseSheet } from './entities/case-sheet.entity';

@Injectable()
export class CaseSheetService {
  constructor(
    @InjectRepository(CaseSheet)
    private readonly caseSheetRepo: Repository<CaseSheet>,
    private readonly appointmentService: AppointmentService,
  ) {}

  async findForUser(user: JwtPayload) {
    if (user.role === Role.ADMIN) {
      return this.caseSheetRepo.find({ order: { updatedAt: 'DESC' } });
    }

    if (user.role === Role.THERAPIST) {
      return this.caseSheetRepo.find({
        where: { therapist: { account: { id: user.userId } } },
        order: { updatedAt: 'DESC' },
      });
    }

    return this.caseSheetRepo.find({
      where: { patient: { id: user.userId } },
      order: { updatedAt: 'DESC' },
    });
  }

  async upsert(dto: UpsertCaseSheetDto, user: JwtPayload) {
    const appointment = await this.appointmentService.findOneForUser(
      dto.appointmentId,
      user,
    );

    let caseSheet = await this.caseSheetRepo.findOne({
      where: { appointment: { id: dto.appointmentId } },
    });

    if (!caseSheet) {
      caseSheet = this.caseSheetRepo.create({
        appointment,
        patient: appointment.patient,
        therapist: appointment.therapist,
      });
    }

    caseSheet.presentingConcern = dto.presentingConcern?.trim() || null;
    caseSheet.clinicalNotes = dto.clinicalNotes?.trim() || null;
    caseSheet.interventionPlan = dto.interventionPlan?.trim() || null;
    caseSheet.followUpPlan = dto.followUpPlan?.trim() || null;

    return this.caseSheetRepo.save(caseSheet);
  }

  async findOne(id: string, user: JwtPayload) {
    const caseSheet = await this.caseSheetRepo.findOne({
      where: { id },
      relations: ['therapist.account'],
    });

    if (!caseSheet) throw new NotFoundException('Case sheet not found');

    if (user.role === Role.ADMIN) return caseSheet;
    if (user.role === Role.PATIENT && caseSheet.patient?.id === user.userId) return caseSheet;
    if (
      user.role === Role.THERAPIST &&
      caseSheet.therapist?.account?.id === user.userId
    ) {
      return caseSheet;
    }

    throw new NotFoundException('Case sheet not found');
  }

  async getSummary() {
    const sheets = await this.caseSheetRepo.find();

    return {
      monitored: sheets.length,
      updated: sheets.filter((sheet) => sheet.updatedAt > sheet.createdAt).length,
    };
  }
}
