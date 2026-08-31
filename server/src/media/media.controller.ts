import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '../user/entities/user.entity';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { MediaService, UploadedFilePayload } from './media.service';

const allowedDeclaredMimeTypes = new Set([
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

type AuthenticatedRequest = { user: JwtPayload };

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.THERAPIST)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        callback(null, allowedDeclaredMimeTypes.has(file.mimetype));
      },
    }),
  )
  upload(
    @UploadedFile() file: UploadedFilePayload | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('Upload a valid image or audio file.');
    }
    return this.mediaService.upload(file, req.user);
  }

  @Delete()
  delete(@Body() dto: DeleteMediaDto, @Req() req: AuthenticatedRequest) {
    return this.mediaService.deleteOwned(
      dto.publicId,
      dto.resourceType,
      req.user,
    );
  }
}
