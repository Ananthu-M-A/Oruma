import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../appointment/entities/appointment.entity';
import { IST_TIME_ZONE } from '../common/ist-date-time';

type ZoomTokenResponse = {
  access_token?: string;
  expires_in?: number;
  api_url?: string;
  error?: string;
  reason?: string;
};

type ZoomMeetingResponse = {
  join_url?: string;
  start_url?: string;
  id?: number;
  topic?: string;
  error?: string;
  message?: string;
};

type CachedZoomToken = {
  accessToken: string;
  apiUrl: string;
  expiresAt: number;
};

@Injectable()
export class ZoomService {
  private readonly logger = new Logger(ZoomService.name);
  private cachedToken: CachedZoomToken | null = null;

  constructor(private readonly configService: ConfigService) {}

  async createAppointmentMeeting(
    appointment: Appointment,
  ): Promise<string | null> {
    if (!this.isConfigured()) {
      this.logger.warn(
        'Zoom meeting generation skipped: Zoom credentials are not configured.',
      );
      return null;
    }

    const token = await this.getAccessToken();
    if (!token) return null;

    const userId = this.resolveHostUserId(appointment);
    const topic = this.buildTopic(appointment);
    const startTime = appointment.slot?.startTime;
    const endTime = appointment.slot?.endTime;
    const duration = this.resolveDurationMinutes(startTime, endTime);

    let response: Response;

    try {
      response = await fetch(
        `${token.apiUrl}/v2/users/${encodeURIComponent(userId)}/meetings`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic,
            type: 2,
            start_time: startTime?.toISOString(),
            duration,
            timezone: IST_TIME_ZONE,
            agenda: `Oruma appointment ${appointment.id}`,
            settings: {
              host_video: true,
              participant_video: true,
              join_before_host: false,
              waiting_room: true,
              approval_type: 2,
            },
          }),
        },
      );
    } catch (error) {
      this.logger.error(
        `Zoom meeting creation failed for appointment ${appointment.id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return null;
    }

    const data = (await response
      .json()
      .catch(() => ({}))) as ZoomMeetingResponse;

    if (!response.ok || !data.join_url) {
      this.logger.error(
        `Zoom meeting creation failed for appointment ${appointment.id}: ${
          data.message ?? data.error ?? response.statusText
        }`,
      );
      return null;
    }

    return data.join_url;
  }

  isConfigured(): boolean {
    return Boolean(
      this.configService.get<string>('ZOOM_ACCOUNT_ID') &&
      this.configService.get<string>('ZOOM_CLIENT_ID') &&
      this.configService.get<string>('ZOOM_CLIENT_SECRET'),
    );
  }

  private async getAccessToken(): Promise<CachedZoomToken | null> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken;
    }

    const accountId = this.configService.get<string>('ZOOM_ACCOUNT_ID');
    const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
    const clientSecret = this.configService.get<string>('ZOOM_CLIENT_SECRET');

    if (!accountId || !clientId || !clientSecret) return null;

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );
    const body = new URLSearchParams({
      grant_type: 'account_credentials',
      account_id: accountId,
    });

    let response: Response;

    try {
      response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
    } catch (error) {
      this.logger.error(
        `Zoom access token request failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return null;
    }

    const data = (await response.json().catch(() => ({}))) as ZoomTokenResponse;

    if (!response.ok || !data.access_token) {
      this.logger.error(
        `Zoom access token request failed: ${
          data.reason ?? data.error ?? response.statusText
        }`,
      );
      return null;
    }

    this.cachedToken = {
      accessToken: data.access_token,
      apiUrl: data.api_url ?? 'https://api.zoom.us',
      expiresAt: Date.now() + ((data.expires_in ?? 3600) - 60) * 1000,
    };

    return this.cachedToken;
  }

  private buildTopic(appointment: Appointment) {
    const patientName =
      appointment.contactName ??
      appointment.patient?.fullName ??
      appointment.patient?.email ??
      'Patient';
    const service = appointment.service ?? 'Therapy Session';

    return `Oruma ${service} - ${patientName}`;
  }

  private resolveHostUserId(appointment: Appointment) {
    return (
      appointment.therapist?.zoomUserId?.trim() ||
      this.configService.get<string>('ZOOM_USER_ID', 'me')
    );
  }

  private resolveDurationMinutes(startTime?: Date, endTime?: Date) {
    if (!startTime || !endTime) return 60;

    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    return durationMinutes > 0 ? durationMinutes : 60;
  }
}
