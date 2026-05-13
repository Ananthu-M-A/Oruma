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

  create(user: Pick<User, 'email' | 'password' | 'role'>): Promise<User> {
    const createdUser = this.userRepository.create(user);

    return this.userRepository.save(createdUser);
  }

  async updateEmail(id: string, email: string): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ id });
    user.email = email;

    return this.userRepository.save(user);
  }
}
