import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

type RegisteredUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(dto: RegisterDto): Promise<RegisteredUser> {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      email,
      password: hashedPassword,
      role: dto.role,
    });
    const { password, ...registeredUser } = user;

    return registeredUser;
  }
}
