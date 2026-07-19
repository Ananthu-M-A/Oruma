import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role, User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email,
      },
      select: ['id', 'email', 'password', 'role', 'createdAt'],
    });
  }

  findPatientByEmailOrPhone(identifier: string): Promise<User | null> {
    const email = identifier.trim().toLowerCase();
    const phone = identifier.replace(/\D/g, '');
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: Role.PATIENT });

    if (email.includes('@')) {
      query.andWhere('user.email = :email', { email });
    } else {
      query.andWhere(
        "regexp_replace(COALESCE(user.phone, ''), '\\D', '', 'g') = :phone",
        { phone },
      );
    }

    return query.getOne();
  }

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  create(
    user: Pick<User, 'email' | 'password' | 'role'> &
      Partial<
        Pick<User, 'fullName' | 'phone' | 'age' | 'gender' | 'healthInfo'>
      >,
  ): Promise<User> {
    const createdUser = this.userRepository.create(user);

    return this.userRepository.save(createdUser);
  }

  countAll(): Promise<number> {
    return this.userRepository.count();
  }

  countByRole(role: User['role']): Promise<number> {
    return this.userRepository.count({
      where: {
        role,
      },
    });
  }

  async updateEmail(id: string, email: string): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ id });
    user.email = email;

    return this.userRepository.save(user);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async updateProfile(
    id: string,
    profile: Partial<
      Pick<User, 'fullName' | 'phone' | 'age' | 'gender' | 'healthInfo'>
    >,
  ): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ id });
    Object.assign(user, profile);

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
