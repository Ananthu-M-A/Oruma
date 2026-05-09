import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { Role, User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';

type RegisteredUser = Omit<User, 'password'>;
type AuthenticatedUser = {
  accessToken: string;
  user: Pick<User, 'id' | 'email' | 'role' | 'createdAt'>;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

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
      role: Role.PATIENT,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async login(dto: LoginDto): Promise<AuthenticatedUser> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }
}
