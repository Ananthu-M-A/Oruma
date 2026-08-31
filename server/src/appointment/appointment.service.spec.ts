import { BadRequestException, ConflictException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentStatus } from './entities/appointment-status.enum';
import { Role } from '../user/entities/user.entity';
import { User } from '../user/entities/user.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { Appointment } from './entities/appointment.entity';
import { TherapistVerificationStatus } from '../therapist/entities/therapist-verification-status.enum';

describe('AppointmentService booking eligibility', () => {
  const createBookingService = (
    therapistOverrides: Record<string, unknown>,
  ) => {
    const therapist = {
      id: 'therapist-1',
      name: 'Therapist',
      price: 1500,
      couplePrice: null,
      consultationType: 'Video',
      isActive: true,
      archivedAt: null,
      verificationStatus: TherapistVerificationStatus.VERIFIED,
      ...therapistOverrides,
    };
    const slot = {
      id: 'slot-1',
      therapist,
      status: 'AVAILABLE',
      startTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
    };
    const slotQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(slot),
    };
    const slotRepository = {
      createQueryBuilder: jest.fn(() => slotQueryBuilder),
      save: jest.fn((value: unknown) => Promise.resolve(value)),
    };
    const appointmentRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value: unknown) => value),
      save: jest.fn((value: unknown) =>
        Promise.resolve({ id: 'appointment-1', ...value }),
      ),
    };
    const patientRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'patient-1',
        email: 'patient@example.com',
      }),
    };
    const manager = {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === AvailabilitySlot) return slotRepository;
        if (entity === Appointment) return appointmentRepository;
        return patientRepository;
      }),
    };
    const dataSource = {
      getRepository: jest.fn((entity: unknown) =>
        entity === User ? patientRepository : appointmentRepository,
      ),
      transaction: jest.fn((callback: (value: typeof manager) => unknown) =>
        callback(manager),
      ),
    };
    const service = new AppointmentService(
      appointmentRepository as never,
      dataSource as never,
      {} as never,
      {} as never,
      {} as never,
      { get: jest.fn() } as never,
      {} as never,
    );
    const patient = {
      userId: 'patient-1',
      email: 'patient@example.com',
      role: Role.PATIENT,
      mustChangePassword: false,
    };
    return { service, patient, appointmentRepository };
  };

  it('rejects a slot when its therapist is hidden', async () => {
    const { service, patient, appointmentRepository } = createBookingService({
      isActive: false,
    });

    await expect(
      service.create(
        {
          slotId: '00000000-0000-4000-8000-000000000000',
          service: 'Individual Therapy',
          mode: 'Video',
        },
        patient,
      ),
    ).rejects.toThrow('not currently available for booking');
    expect(appointmentRepository.save).not.toHaveBeenCalled();
  });

  it('rejects modes and couple services the therapist does not offer', async () => {
    const first = createBookingService({ consultationType: 'Video' });
    await expect(
      first.service.create(
        {
          slotId: '00000000-0000-4000-8000-000000000000',
          service: 'Individual Therapy',
          mode: 'Audio',
        },
        first.patient,
      ),
    ).rejects.toThrow('session mode is not offered');

    const second = createBookingService({ couplePrice: null });
    await expect(
      second.service.create(
        {
          slotId: '00000000-0000-4000-8000-000000000000',
          service: 'Couple Therapy',
          mode: 'Video',
        },
        second.patient,
      ),
    ).rejects.toThrow('Couple therapy is not offered');
  });
});

describe('AppointmentService quick booking', () => {
  it('does not issue a booking token for an existing patient contact', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 'existing-patient',
          email: 'patient@example.com',
          phone: '918157039987',
        },
      ]),
    };
    const userRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn(() => userRepository),
    };
    const dataSource = {
      transaction: (
        runInTransaction: (entityManager: typeof manager) => Promise<unknown>,
      ) => runInTransaction(manager),
    };
    const service = new AppointmentService(
      {} as never,
      dataSource as never,
      {} as never,
      {} as never,
      {
        verifyQuickBookingToken: jest
          .fn()
          .mockReturnValue('patient@example.com'),
      } as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.createQuickBooking({
        slotId: '00000000-0000-4000-8000-000000000000',
        contactEmail: 'patient@example.com',
        contactPhone: '+91 81570 39987',
        verificationToken: 'verified-booking-token',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});

describe('AppointmentService manual operations', () => {
  const appointment = () => ({
    id: 'appointment-1',
    status: AppointmentStatus.CONFIRMED,
    meetingLink: null,
    meetingLinkAddedAt: null,
    bookingConfirmationSentAt: null,
    meetingLinkSentAt: null,
    reminderSentAt: null,
    staffNotes: null,
    service: 'Individual Therapy',
    patient: { id: 'patient-1', email: 'patient@example.com' },
    therapist: {
      id: 'therapist-1',
      name: 'Therapist',
      account: { id: 'therapist-user-1' },
    },
    slot: {
      startTime: new Date('2026-08-20T04:30:00.000Z'),
      endTime: new Date('2026-08-20T05:30:00.000Z'),
    },
  });

  it('stores a staff-created Zoom link and manual delivery timestamps', async () => {
    const currentAppointment = appointment();
    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(currentAppointment),
    };
    const appointmentRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
      save: jest.fn((value: unknown) => Promise.resolve(value)),
    };
    const notificationService = { createMany: jest.fn() };
    const service = new AppointmentService(
      appointmentRepository as never,
      {} as never,
      {} as never,
      notificationService as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.updateOperations(
      currentAppointment.id,
      {
        meetingLink: 'https://us06web.zoom.us/j/123456789',
        markMeetingLinkSent: true,
        markReminderSent: true,
        staffNotes: 'Patient contacted from the official number.',
      },
      { userId: 'admin-1', email: 'admin@example.com', role: Role.ADMIN },
    );

    expect(result.meetingLink).toBe('https://us06web.zoom.us/j/123456789');
    expect(result.meetingLinkAddedAt).toBeInstanceOf(Date);
    expect(result.meetingLinkSentAt).toBeInstanceOf(Date);
    expect(result.reminderSentAt).toBeInstanceOf(Date);
    expect(result.staffNotes).toBe(
      'Patient contacted from the official number.',
    );
    expect(notificationService.createMany).toHaveBeenCalledTimes(1);
  });

  it('prevents confirmation until payment is recorded', async () => {
    const currentAppointment = {
      ...appointment(),
      status: AppointmentStatus.PENDING,
    };
    const appointmentRepository = {
      findOne: jest.fn().mockResolvedValue(currentAppointment),
      save: jest.fn(),
    };
    const dataSource = {
      getRepository: jest.fn(() => ({
        exists: jest.fn().mockResolvedValue(false),
      })),
    };
    const service = new AppointmentService(
      appointmentRepository as never,
      dataSource as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.updateStatus(
        currentAppointment.id,
        { status: AppointmentStatus.CONFIRMED },
        { userId: 'admin-1', email: 'admin@example.com', role: Role.ADMIN },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(appointmentRepository.save).not.toHaveBeenCalled();
  });
});
