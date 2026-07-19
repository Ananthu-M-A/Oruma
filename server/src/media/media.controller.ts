import {
  BadRequestException,
  InternalServerErrorException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../user/entities/user.entity';

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
  'audio/x-aac',
  'audio/x-m4a',
  'audio/m4a',
]);

type UploadedFilePayload = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

type CloudinaryResponse = {
  secure_url?: string;
  url?: string;
  public_id?: string;
  resource_type?: string;
  bytes?: number;
  error?: {
    message?: string;
  };
};

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.THERAPIST)
export class MediaController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        callback(null, allowedMimeTypes.has(file.mimetype));
      },
    }),
  )
  async upload(@UploadedFile() file?: UploadedFilePayload) {
    if (!file) {
      throw new BadRequestException('Upload a valid image or audio file.');
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
    const base64 = file.buffer.toString('base64');

    form.append('file', `data:${file.mimetype};base64,${base64}`);
    form.append('upload_preset', uploadPreset);
    form.append('folder', 'oruma/therapists');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: form,
    });
    const data = (await response
      .json()
      .catch(() => ({}))) as CloudinaryResponse;

    if (!response.ok || !data.secure_url) {
      throw new BadRequestException(
        data.error?.message ?? 'Cloudinary upload failed.',
      );
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
      mimeType: file.mimetype,
      size: data.bytes ?? file.size,
    };
  }
}
