import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { businessConfig } from '../config/business.config';
import { NotificationType } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { ProviderJobService } from '../reliability/provider-job.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { Enquiry, EnquiryStatus } from './entities/enquiry.entity';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

@Injectable()
export class EnquiryService {
  private readonly logger = new Logger(EnquiryService.name);

  constructor(
    @InjectRepository(Enquiry)
    private readonly enquiryRepo: Repository<Enquiry>,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly providerJobService: ProviderJobService,
  ) {}

  async create(dto: CreateEnquiryDto) {
    // Honeypot filled in: answer like a success so bots learn nothing.
    if (dto.website?.trim()) return { received: true };

    const enquiry = await this.enquiryRepo.save(
      this.enquiryRepo.create({
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone || null,
        preferredContact: dto.preferredContact,
        subject: dto.subject,
        message: dto.message,
        pagePath: dto.pagePath ?? null,
        status: EnquiryStatus.NEW,
        consentedAt: new Date(),
      }),
    );

    const results = await Promise.allSettled([
      this.notifyCareTeam(enquiry),
      this.acknowledge(enquiry),
      this.notificationService.notifyAdmins({
        type: NotificationType.SUPPORT,
        title: 'New website enquiry',
        body: `${enquiry.subject} from ${enquiry.name}`,
        actionUrl: '/profile/admin',
        metadata: { enquiryId: enquiry.id },
      }),
    ]);
    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.error(
          JSON.stringify({
            event: 'enquiry_notification_failed',
            enquiryId: enquiry.id,
            error:
              result.reason instanceof Error
                ? result.reason.message
                : 'Unknown error',
          }),
        );
      }
    }

    return { received: true };
  }

  findAll() {
    return this.enquiryRepo.find({ order: { createdAt: 'DESC' }, take: 200 });
  }

  async update(id: string, dto: UpdateEnquiryDto) {
    const enquiry = await this.enquiryRepo.findOne({ where: { id } });
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    if (dto.status) enquiry.status = dto.status;
    if (dto.adminNote !== undefined)
      enquiry.adminNote = dto.adminNote.trim() || null;
    return this.enquiryRepo.save(enquiry);
  }

  private careTeamEmail() {
    return (
      this.configService.get<string>('OPS_NOTIFICATION_EMAIL')?.trim() ||
      businessConfig.emails.support
    );
  }

  private notifyCareTeam(enquiry: Enquiry) {
    const adminUrl = `${businessConfig.website}/profile/admin`;
    const lines: Array<[string, string]> = [
      ['Name', enquiry.name],
      ['Email', enquiry.email],
      ['Phone', enquiry.phone ?? 'Not given'],
      ['Preferred contact', enquiry.preferredContact],
      ['Subject', enquiry.subject],
      ['Sent from page', enquiry.pagePath ?? 'Not recorded'],
    ];
    return this.providerJobService.enqueueEmail(
      {
        to: this.careTeamEmail(),
        subject: `New website enquiry: ${enquiry.subject}`,
        text: [
          'A new enquiry was sent from the Oruma contact form.',
          ...lines.map(([label, value]) => `${label}: ${value}`),
          '',
          enquiry.message,
          '',
          `Manage enquiries: ${adminUrl}`,
        ].join('\n'),
        html: `
          <p>A new enquiry was sent from the Oruma contact form.</p>
          ${lines
            .map(
              ([label, value]) =>
                `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`,
            )
            .join('')}
          <p style="white-space:pre-wrap">${escapeHtml(enquiry.message)}</p>
          <p><a href="${adminUrl}">Manage enquiries</a></p>
        `,
      },
      { deduplicationKey: `enquiry:${enquiry.id}:ops:email` },
    );
  }

  /**
   * Fixed text only: echoing the visitor's message back would let anyone use
   * the form to send arbitrary content to any address.
   */
  private acknowledge(enquiry: Enquiry) {
    const brand = businessConfig.brandName;
    return this.providerJobService.enqueueEmail(
      {
        to: enquiry.email,
        subject: `We've received your message to ${brand}`,
        text: [
          `Thank you for contacting ${brand}. We've received your message and will reply using your preferred contact method.`,
          'If you need urgent help, please contact your local emergency services. Online counselling is not an emergency service.',
          `${brand} support: ${businessConfig.emails.support}`,
        ].join('\n'),
        html: `
          <p>Thank you for contacting ${brand}. We've received your message and will reply using your preferred contact method.</p>
          <p>If you need urgent help, please contact your local emergency services. Online counselling is not an emergency service.</p>
          <p>${brand} support: ${businessConfig.emails.support}</p>
        `,
      },
      { deduplicationKey: `enquiry:${enquiry.id}:ack:email` },
    );
  }
}
