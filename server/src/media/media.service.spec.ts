import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role } from '../user/entities/user.entity';
import { MediaService } from './media.service';

describe('MediaService', () => {
  const user = {
    userId: 'therapist-user-1',
    email: 'therapist@example.com',
    role: Role.THERAPIST,
    mustChangePassword: false,
  };

  it('rejects a file whose contents do not match a supported format', async () => {
    const service = new MediaService();

    await expect(
      service.upload(
        {
          buffer: Buffer.from('not an image'),
          originalname: 'profile.jpg',
          mimetype: 'image/jpeg',
          size: 12,
        },
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents a therapist from deleting another account media folder', async () => {
    const service = new MediaService();

    await expect(
      service.deleteOwned(
        'oruma/therapists/another-user/profile',
        'image',
        user,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
