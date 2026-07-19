import { ForbiddenException } from '@nestjs/common';
import { CaseSheetService } from './case-sheet.service';
import { Role } from '../user/entities/user.entity';

describe('CaseSheetService', () => {
  const createService = () => {
    const caseSheetRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    const appointmentService = {
      findOneForUser: jest.fn(),
    };

    return {
      service: new CaseSheetService(
        caseSheetRepo as never,
        appointmentService as never,
      ),
      caseSheetRepo,
      appointmentService,
    };
  };

  it('allows admins to list case sheets', async () => {
    const { service, caseSheetRepo } = createService();
    caseSheetRepo.find.mockResolvedValue([{ id: 'case-1' }]);

    const result = await service.findForUser({
      userId: 'admin-1',
      email: 'admin@example.com',
      role: Role.ADMIN,
    });

    expect(result).toEqual([{ id: 'case-1' }]);
    expect(caseSheetRepo.find).toHaveBeenCalledWith({
      order: { updatedAt: 'DESC' },
    });
  });

  it('allows therapists to list only their case sheets', async () => {
    const { service, caseSheetRepo } = createService();
    caseSheetRepo.find.mockResolvedValue([{ id: 'case-1' }]);

    await service.findForUser({
      userId: 'therapist-user-1',
      email: 'therapist@example.com',
      role: Role.THERAPIST,
    });

    expect(caseSheetRepo.find).toHaveBeenCalledWith({
      where: { therapist: { account: { id: 'therapist-user-1' } } },
      order: { updatedAt: 'DESC' },
    });
  });

  it('blocks patients from listing clinical case sheets', async () => {
    const { service, caseSheetRepo } = createService();

    await expect(
      service.findForUser({
        userId: 'patient-1',
        email: 'patient@example.com',
        role: Role.PATIENT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(caseSheetRepo.find).not.toHaveBeenCalled();
  });

  it('keeps case-sheet editing therapist-only while admins retain read access', async () => {
    const { service, appointmentService } = createService();

    await expect(
      service.upsert(
        { appointmentId: 'appointment-1', clinicalNotes: 'Private notes' },
        {
          userId: 'admin-1',
          email: 'admin@example.com',
          role: Role.ADMIN,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(appointmentService.findOneForUser).not.toHaveBeenCalled();
  });
});
