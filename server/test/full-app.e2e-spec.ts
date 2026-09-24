import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { AvailabilitySlot } from '../src/availability/entities/availability-slot.entity';
import { SlotStatus } from '../src/availability/entities/slot-status.enum';
import { Payment } from '../src/payment/entities/payment.entity';
import { PaymentRefund } from '../src/payment/entities/payment-refund.entity';
import { PaymentWebhookEvent } from '../src/payment/entities/payment-webhook-event.entity';
import { Therapist } from '../src/therapist/entities/therapist.entity';
import { TherapistVerificationStatus } from '../src/therapist/entities/therapist-verification-status.enum';
import { Role, User } from '../src/user/entities/user.entity';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'database-e2e-secret';
process.env.PROVIDER_WORKER_ENABLED = 'false';
process.env.RESERVATION_CLEANUP_ENABLED = 'false';
process.env.DATA_RETENTION_WORKER_ENABLED = 'false';
process.env.PAYMENT_BYPASS_ENABLED = 'true';
process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED = 'true';
process.env.RAZORPAY_WEBHOOK_SECRET = 'database-e2e-webhook-secret';

const databaseDescribe =
  process.env.RUN_DATABASE_E2E === 'true' ? describe : describe.skip;

type AuthBody = { accessToken: string };
type BookingBody = { id: string };
type QuickOtpBody = { devCode: string };
type QuickVerifyBody = { verificationToken: string };
type WebhookBody = { duplicate: boolean };

databaseDescribe('Full application with PostgreSQL (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let patientOneToken: string;
  let patientTwoToken: string;
  let therapistToken: string;
  let adminToken: string;
  let therapist: Therapist;
  let slot: AvailabilitySlot;

  const bodyAs = <T>(response: Response) => response.body as unknown as T;
  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  const login = async (email: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Password123!' })
      .expect(201);
    return bodyAs<AuthBody>(response).accessToken;
  };

  const seedApplication = async () => {
    const userRepository = dataSource.getRepository(User);
    const password = await bcrypt.hash('Password123!', 4);
    const [admin, therapistAccount, patientOne, patientTwo] =
      await userRepository.save([
        userRepository.create({
          email: 'admin@oruma.test',
          password,
          role: Role.ADMIN,
        }),
        userRepository.create({
          email: 'therapist@oruma.test',
          password,
          role: Role.THERAPIST,
        }),
        userRepository.create({
          email: 'patient-one@oruma.test',
          password,
          role: Role.PATIENT,
        }),
        userRepository.create({
          email: 'patient-two@oruma.test',
          password,
          role: Role.PATIENT,
        }),
      ]);
    expect(admin).toBeDefined();
    expect(patientOne).toBeDefined();
    expect(patientTwo).toBeDefined();

    const therapistRepository = dataSource.getRepository(Therapist);
    therapist = await therapistRepository.save(
      therapistRepository.create({
        name: 'E2E Therapist',
        email: therapistAccount.email,
        account: therapistAccount,
        isActive: true,
        price: 1200,
        title: 'Psychologist',
        consultationType: 'Video',
        sessionDurationMinutes: 60,
        verificationStatus: TherapistVerificationStatus.VERIFIED,
      }),
    );
    const startsAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    slot = await dataSource.getRepository(AvailabilitySlot).save({
      therapist,
      startTime: startsAt,
      endTime: new Date(startsAt.getTime() + 60 * 60 * 1000),
      status: SlotStatus.AVAILABLE,
    });

    [adminToken, therapistToken, patientOneToken, patientTwoToken] =
      await Promise.all([
        login('admin@oruma.test'),
        login('therapist@oruma.test'),
        login('patient-one@oruma.test'),
        login('patient-two@oruma.test'),
      ]);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication({ rawBody: true });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "audit_event", "privacy_request", "payment_webhook_event", "payment_refund", "provider_job", "notification", "case_sheet", "payment", "appointment", "availability_slot", "therapist", "login_otp", "ticket", "user" RESTART IDENTITY CASCADE',
    );
    await seedApplication();
  });

  afterAll(async () => {
    await app.close();
  });

  it('enforces authentication and role boundaries through the real module', async () => {
    await request(app.getHttpServer()).get('/ready').expect(200);
    await request(app.getHttpServer()).get('/auth/admin').expect(401);
    await request(app.getHttpServer())
      .get('/auth/admin')
      .set(bearer(patientOneToken))
      .expect(403);
    await request(app.getHttpServer())
      .get('/auth/admin')
      .set(bearer(adminToken))
      .expect(200);
  });

  it('serializes simultaneous booking and payment requests', async () => {
    const bookingPayload = {
      slotId: slot.id,
      service: 'Individual Therapy',
      mode: 'Video',
      contactEmail: 'patient-one@oruma.test',
    };
    const responses = await Promise.all([
      request(app.getHttpServer())
        .post('/appointments')
        .set(bearer(patientOneToken))
        .send(bookingPayload),
      request(app.getHttpServer())
        .post('/appointments')
        .set(bearer(patientTwoToken))
        .send({
          ...bookingPayload,
          contactEmail: 'patient-two@oruma.test',
        }),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
    const successful = responses.find((response) => response.status === 201);
    expect(successful).toBeDefined();
    const appointmentId = bodyAs<BookingBody>(successful as Response).id;
    const winningToken =
      responses[0].status === 201 ? patientOneToken : patientTwoToken;

    const payments = await Promise.all([
      request(app.getHttpServer())
        .post('/payments/development/complete')
        .set(bearer(winningToken))
        .send({ appointmentId }),
      request(app.getHttpServer())
        .post('/payments/development/complete')
        .set(bearer(winningToken))
        .send({ appointmentId }),
    ]);
    expect(payments.every((response) => response.status === 201)).toBe(true);
    expect(
      await dataSource.getRepository(Payment).count({
        where: { appointment: { id: appointmentId } },
      }),
    ).toBe(1);

    const paymentId = bodyAs<{ id: string }>(payments[0]).id;
    const refundKey = 'e2e-refund-operation-1';
    await request(app.getHttpServer())
      .patch(`/payments/${paymentId}/refund`)
      .set(bearer(adminToken))
      .set('Idempotency-Key', refundKey)
      .send({ amount: 1200 })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/payments/${paymentId}/refund`)
      .set(bearer(adminToken))
      .set('Idempotency-Key', refundKey)
      .send({ amount: 1200 })
      .expect(200);
    expect(
      await dataSource.getRepository(PaymentRefund).count({
        where: { idempotencyKey: refundKey },
      }),
    ).toBe(1);
  });

  it('requires contact OTP verification before a quick booking', async () => {
    const otpResponse = await request(app.getHttpServer())
      .post('/auth/booking/otp/request')
      .send({ identifier: 'new-patient@oruma.test' })
      .expect(201);
    const code = bodyAs<QuickOtpBody>(otpResponse).devCode;
    expect(code).toHaveLength(6);
    const verifyResponse = await request(app.getHttpServer())
      .post('/auth/booking/otp/verify')
      .send({ identifier: 'new-patient@oruma.test', code })
      .expect(201);
    const verificationToken =
      bodyAs<QuickVerifyBody>(verifyResponse).verificationToken;

    await request(app.getHttpServer())
      .post('/appointments/quick')
      .send({
        slotId: slot.id,
        contactEmail: 'new-patient@oruma.test',
        mode: 'Video',
        verificationToken,
      })
      .expect(201);
  });

  it('deduplicates signed payment webhooks durably', async () => {
    const payload = {
      id: 'event-e2e-1',
      event: 'payment.failed',
      payload: { payment: { entity: { id: 'pay-1', order_id: 'missing' } } },
    };
    const rawBody = JSON.stringify(payload);
    const signature = createHmac(
      'sha256',
      process.env.RAZORPAY_WEBHOOK_SECRET as string,
    )
      .update(rawBody)
      .digest('hex');
    const first = await request(app.getHttpServer())
      .post('/payments/razorpay/webhook')
      .set('x-razorpay-signature', signature)
      .set('Content-Type', 'application/json')
      .send(rawBody)
      .expect(201);
    const second = await request(app.getHttpServer())
      .post('/payments/razorpay/webhook')
      .set('x-razorpay-signature', signature)
      .set('Content-Type', 'application/json')
      .send(rawBody)
      .expect(201);

    expect(bodyAs<WebhookBody>(first).duplicate).toBe(false);
    expect(bodyAs<WebhookBody>(second).duplicate).toBe(true);
    expect(await dataSource.getRepository(PaymentWebhookEvent).count()).toBe(1);
  });

  it('lets a patient cancel their booking and releases the slot', async () => {
    const appointmentResponse = await request(app.getHttpServer())
      .post('/appointments')
      .set(bearer(patientOneToken))
      .send({
        slotId: slot.id,
        contactEmail: 'patient-one@oruma.test',
        mode: 'Video',
      })
      .expect(201);
    const appointmentId = bodyAs<BookingBody>(appointmentResponse).id;
    await request(app.getHttpServer())
      .delete(`/appointments/${appointmentId}`)
      .set(bearer(patientOneToken))
      .expect(200);
    const released = await dataSource
      .getRepository(AvailabilitySlot)
      .findOneByOrFail({ id: slot.id });
    expect(released.status).toBe(SlotStatus.AVAILABLE);
  });

  it('protects clinical records and supports patient data export', async () => {
    const appointmentResponse = await request(app.getHttpServer())
      .post('/appointments')
      .set(bearer(patientOneToken))
      .send({
        slotId: slot.id,
        contactEmail: 'patient-one@oruma.test',
        mode: 'Video',
      })
      .expect(201);
    const appointmentId = bodyAs<BookingBody>(appointmentResponse).id;
    await request(app.getHttpServer())
      .patch('/case-sheets')
      .set(bearer(therapistToken))
      .send({ appointmentId, clinicalNotes: 'Confidential E2E note' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/case-sheets')
      .set(bearer(patientOneToken))
      .expect(403);
    await request(app.getHttpServer())
      .get('/case-sheets')
      .set(bearer(adminToken))
      .expect(200)
      .expect((response: Response) => {
        expect(bodyAs<unknown[]>(response)).toHaveLength(1);
      });
    await request(app.getHttpServer())
      .get('/privacy/me/export')
      .set(bearer(patientOneToken))
      .expect(200)
      .expect((response: Response) => {
        const body = bodyAs<{ account: { email: string } }>(response);
        expect(body.account.email).toBe('patient-one@oruma.test');
      });
  });
});
