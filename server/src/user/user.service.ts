import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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
      select: ['id', 'email', 'password', 'role'],
    });
  }

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  create(user: Pick<User, 'email' | 'password' | 'role'>): Promise<User> {
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
