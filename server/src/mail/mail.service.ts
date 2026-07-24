import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('RESEND_API_KEY'));
  }

  async send(input: SendMailInput): Promise<boolean> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from = this.configService.get<string>(
      'EMAIL_FROM',
      'Oruma <no-reply@oruma.me>',
    );

    if (!apiKey) {
      this.logger.warn(
        `Email is not configured. Intended message to ${input.to}: ${input.subject}\n${input.text}`,
      );
      return false;
    }

    let response: Response;

    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${input.to}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return false;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`Failed to send email to ${input.to}: ${body}`);
      return false;
    }

    return true;
  }
}
