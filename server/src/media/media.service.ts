import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '../user/entities/user.entity';

export type UploadedFilePayload = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

type CloudinaryResponse = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  bytes?: number;
  error?: { message?: string };
};

@Injectable()
export class MediaService {
  async upload(file: UploadedFilePayload, user: JwtPayload) {
    const detectedMimeType = this.detectMimeType(file.buffer);
    if (!detectedMimeType) {
      throw new BadRequestException(
        'The file contents are not a supported image or audio format.',
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      throw new InternalServerErrorException(
        'Cloudinary upload is not configured.',
      );
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    const form = new FormData();
    form.append(
      'file',
      `data:${detectedMimeType};base64,${file.buffer.toString('base64')}`,
    );
    form.append('upload_preset', uploadPreset);
    form.append('folder', `oruma/therapists/${user.userId}`);

    const response = await fetch(endpoint, { method: 'POST', body: form });
    const data = (await response
      .json()
      .catch(() => ({}))) as CloudinaryResponse;
    if (!response.ok || !data.secure_url || !data.public_id) {
      throw new BadRequestException(
        data.error?.message ?? 'Cloudinary upload failed.',
      );
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type ?? 'raw',
      mimeType: detectedMimeType,
      size: data.bytes ?? file.size,
    };
  }

  async deleteOwned(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw',
    user: JwtPayload,
  ) {
    const normalized = publicId.trim();
    const ownedPrefix = `oruma/therapists/${user.userId}/`;
    if (
      !normalized.startsWith('oruma/therapists/') ||
      (user.role !== Role.ADMIN && !normalized.startsWith(ownedPrefix))
    ) {
      throw new ForbiddenException('You cannot delete this media asset');
    }
    await this.delete(normalized, resourceType);
    return { message: 'Media deleted' };
  }

  async delete(
    publicId: string | null | undefined,
    resourceType: 'image' | 'video' | 'raw',
  ) {
    if (!publicId) return;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');
    const form = new FormData();
    form.append('public_id', publicId);
    form.append('timestamp', String(timestamp));
    form.append('api_key', apiKey);
    form.append('signature', signature);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: 'POST', body: form },
    );
    if (!response.ok) {
      throw new BadRequestException('Unable to delete the media asset');
    }
  }

  private detectMimeType(buffer: Buffer) {
    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    )
      return 'image/jpeg';
    if (buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')))
      return 'image/png';
    if (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    )
      return 'image/webp';
    if (/^GIF8[79]a$/.test(buffer.subarray(0, 6).toString('ascii')))
      return 'image/gif';
    if (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WAVE'
    )
      return 'audio/wav';
    if (buffer.subarray(0, 4).toString('ascii') === 'OggS') return 'audio/ogg';
    if (buffer.subarray(0, 3).toString('ascii') === 'ID3') return 'audio/mpeg';
    if (
      buffer.length >= 2 &&
      buffer[0] === 0xff &&
      [0xf2, 0xf3, 0xfb].includes(buffer[1] & 0xfb)
    )
      return 'audio/mpeg';
    if (buffer.length >= 2 && buffer[0] === 0xff && (buffer[1] & 0xf6) === 0xf0)
      return 'audio/aac';
    if (buffer.subarray(0, 4).equals(Buffer.from('1a45dfa3', 'hex')))
      return 'audio/webm';
    if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') return 'audio/mp4';
    return null;
  }
}
