import { ConfigService } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';

describe('WhatsAppService', () => {
  const config = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
    });
  });

  it('sends template messages through the configured Graph API version', async () => {
    config.get.mockImplementation((key: string, fallback?: string) => {
      const values: Record<string, string> = {
        WHATSAPP_ACCESS_TOKEN: 'token',
        WHATSAPP_PHONE_NUMBER_ID: '12345',
        WHATSAPP_APPOINTMENT_TEMPLATE_NAME: 'appointment_confirmation',
        WHATSAPP_TEMPLATE_LANGUAGE: 'en',
        WHATSAPP_API_VERSION: 'v21.0',
      };

      return values[key] ?? fallback;
    });

    const service = new WhatsAppService(config as unknown as ConfigService);

    await expect(
      service.send({
        to: '8157039987',
        text: 'Appointment booked',
        templateParameters: ['Therapy', 'Dr Oruma', '10 AM'],
      }),
    ).resolves.toBe(true);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v21.0/12345/messages',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: '918157039987',
          type: 'template',
          template: {
            name: 'appointment_confirmation',
            language: {
              code: 'en',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: 'Therapy' },
                  { type: 'text', text: 'Dr Oruma' },
                  { type: 'text', text: '10 AM' },
                ],
              },
            ],
          },
        }),
      },
    );
  });

  it('falls back to text messages when no template is configured', async () => {
    config.get.mockImplementation((key: string, fallback?: string) => {
      const values: Record<string, string> = {
        WHATSAPP_ACCESS_TOKEN: 'token',
        WHATSAPP_PHONE_NUMBER_ID: '12345',
      };

      return values[key] ?? fallback;
    });

    const service = new WhatsAppService(config as unknown as ConfigService);

    await service.send({
      to: '+91 81570 39987',
      text: 'Your login code is 123456',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v20.0/12345/messages',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: '918157039987',
          type: 'text',
          text: {
            preview_url: false,
            body: 'Your login code is 123456',
          },
        }),
      },
    );
  });
});
