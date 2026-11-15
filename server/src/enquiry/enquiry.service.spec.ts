import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { EnquiryStatus } from './entities/enquiry.entity';
import { EnquiryService } from './enquiry.service';

describe('EnquiryService', () => {
  const validInput = {
    name: 'Asha',
    email: 'Asha@Example.com',
    preferredContact: 'email' as const,
    subject: 'Choosing a practitioner' as const,
    message: 'I would like help choosing a counsellor.',
    consent: true,
    pagePath: '/contact',
  };

  const createService = () => {
    const enquiryRepo = {
      create: jest.fn((value: Record<string, unknown>) => value),
      save: jest.fn((value: Record<string, unknown>) =>
        Promise.resolve({ id: 'enquiry-1', ...value }),
      ),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    const providerJobService = { enqueueEmail: jest.fn() };
    const notificationService = {
      notifyAdmins: jest.fn().mockResolvedValue([]),
    };
    const service = new EnquiryService(
      enquiryRepo as never,
      { get: jest.fn(() => 'care-team@example.com') } as never,
      notificationService as never,
      providerJobService as never,
    );
    return { service, enquiryRepo, providerJobService, notificationService };
  };

  it('saves an enquiry, alerts the care team and acknowledges the visitor', async () => {
    const { service, enquiryRepo, providerJobService, notificationService } =
      createService();

    await expect(service.create(validInput)).resolves.toEqual({
      received: true,
    });

    expect(enquiryRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'asha@example.com',
        status: EnquiryStatus.NEW,
      }),
    );
    const recipients = (
      providerJobService.enqueueEmail.mock.calls as Array<[{ to: string }]>
    ).map(([email]) => email.to);
    expect(recipients).toEqual(['care-team@example.com', 'asha@example.com']);
    expect(notificationService.notifyAdmins).toHaveBeenCalled();
  });

  it('does not echo the visitor message in the acknowledgement email', async () => {
    const { service, providerJobService } = createService();
    await service.create(validInput);
    const [, [ack]] = providerJobService.enqueueEmail.mock.calls as Array<
      [{ text: string; html: string }]
    >;
    expect(ack.text).not.toContain(validInput.message);
    expect(ack.html).not.toContain(validInput.message);
  });

  it('silently drops submissions that fill in the honeypot field', async () => {
    const { service, enquiryRepo, providerJobService } = createService();

    await expect(
      service.create({ ...validInput, website: 'https://spam.example' }),
    ).resolves.toEqual({ received: true });

    expect(enquiryRepo.save).not.toHaveBeenCalled();
    expect(providerJobService.enqueueEmail).not.toHaveBeenCalled();
  });

  it('escapes HTML in the care-team email', async () => {
    const { service, providerJobService } = createService();
    await service.create({
      ...validInput,
      name: '<img src=x onerror=alert(1)>',
    });
    const [[opsEmail]] = providerJobService.enqueueEmail.mock.calls as Array<
      [{ html: string }]
    >;
    expect(opsEmail.html).not.toContain('<img');
    expect(opsEmail.html).toContain('&lt;img');
  });

  it('requires consent, a valid email and a known subject', async () => {
    const dto = plainToInstance(CreateEnquiryDto, {
      ...validInput,
      email: 'not-an-email',
      subject: 'Unknown',
      consent: false,
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property).sort()).toEqual([
      'consent',
      'email',
      'subject',
    ]);
  });

  it('accepts a valid submission', async () => {
    const dto = plainToInstance(CreateEnquiryDto, validInput);
    await expect(validate(dto)).resolves.toEqual([]);
  });
});
