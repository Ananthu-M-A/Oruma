import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TemplateComponent = {
  type: 'body';
  parameters: Array<{
    type: 'text';
    text: string;
  }>;
};

type SendWhatsAppInput = {
  to?: string | null;
  text: string;
  templateParameters?: string[];
};

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly configService: ConfigService) {}

  async send(input: SendWhatsAppInput): Promise<boolean> {
    const to = this.normalizePhone(input.to);
    const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = this.configService.get<string>(
      'WHATSAPP_PHONE_NUMBER_ID',
    );
    const templateName = this.configService.get<string>(
      'WHATSAPP_APPOINTMENT_TEMPLATE_NAME',
    );
    const languageCode = this.configService.get<string>(
      'WHATSAPP_TEMPLATE_LANGUAGE',
      'en',
    );

    if (!to) {
      this.logger.warn('WhatsApp notification skipped: missing phone number.');
      return false;
    }

    if (!accessToken || !phoneNumberId) {
      this.logger.warn(
        `WhatsApp is not configured. Intended message to ${to}: ${input.text}`,
      );
      return false;
    }

    const body = templateName
      ? this.createTemplatePayload(to, templateName, languageCode, input)
      : {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            preview_url: false,
            body: input.text,
          },
        };

    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const responseBody = await response.text().catch(() => '');
        this.logger.error(
          `Failed to send WhatsApp notification to ${to}: ${responseBody}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp notification to ${to}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return false;
    }
  }

  private createTemplatePayload(
    to: string,
    templateName: string,
    languageCode: string,
    input: SendWhatsAppInput,
  ) {
    const components: TemplateComponent[] = input.templateParameters?.length
      ? [
          {
            type: 'body',
            parameters: input.templateParameters.map((text) => ({
              type: 'text',
              text,
            })),
          },
        ]
      : [];

    return {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        ...(components.length ? { components } : {}),
      },
    };
  }

  private normalizePhone(phone?: string | null) {
    if (!phone) return '';

    const trimmed = phone.trim();
    const hasPlus = trimmed.startsWith('+');
    const digits = trimmed.replace(/\D/g, '');

    if (!digits) return '';

    return hasPlus ? digits : digits;
  }
}
