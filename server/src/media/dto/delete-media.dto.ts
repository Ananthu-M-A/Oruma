import { IsIn, IsString, MaxLength } from 'class-validator';

export class DeleteMediaDto {
  @IsString()
  @MaxLength(255)
  publicId: string;

  @IsIn(['image', 'video', 'raw'])
  resourceType: 'image' | 'video' | 'raw';
}
