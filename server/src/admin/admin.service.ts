import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AppointmentStatus } from '../appointment/entities/appointment-status.enum';
import { Therapist } from '../therapist/entities/therapist.entity';
import { Role } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CaseSheetService } from '../case-sheet/case-sheet.service';
import { PaymentService } from '../payment/payment.service';
import { TicketService } from '../ticket/ticket.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Therapist)
    private readonly therapistRepo: Repository<Therapist>,
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
    private readonly ticketService: TicketService,
    private readonly caseSheetService: CaseSheetService,
  ) {}

  async getDashboardSummary() {
    const [
      patientCount,
      therapistUserCount,
      therapists,
      appointments,
      paymentSummary,
      ticketSummary,
      caseSheetSummary,
    ] =
      await Promise.all([
        this.userService.countByRole(Role.PATIENT),
        this.userService.countByRole(Role.THERAPIST),
        this.therapistRepo.find(),
        this.appointmentRepo.find(),
        this.paymentService.getSummary(),
        this.ticketService.getSummary(),
        this.caseSheetService.getSummary(),
      ]);

    const completedAppointments = appointments.filter(
      (appointment) => appointment.status === AppointmentStatus.COMPLETED,
    );
    const revenue = completedAppointments.reduce((sum, appointment) => {
      return sum + (appointment.therapist?.price ?? 0);
    }, 0);

    return {
      patients: patientCount,
      therapistUsers: therapistUserCount,
      therapists: therapists.length,
      activeTherapists: therapists.filter((therapist) => therapist.isActive)
        .length,
      appointments: appointments.length,
      sessions: completedAppointments.length,
      pendingAppointments: appointments.filter(
        (appointment) => appointment.status === AppointmentStatus.PENDING,
      ).length,
      revenue,
      pendingTherapistUpdates: therapists.filter(
        (therapist) => therapist.pendingProfileChanges,
      ).length,
      payments: paymentSummary,
      tickets: ticketSummary,
      caseSheets: caseSheetSummary,
    };
  }
}
