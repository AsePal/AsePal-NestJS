import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async createUser(data: {
    username: string;
    passwordHash: string;
    email?: string;
    phone?: string;
  }) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async findByUsername(username: string) {
    return this.repo.findOne({
      where: { username },
    });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findForLogin(identifier: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.username = :identifier', { identifier })
      .orWhere('u.email = :identifier', { identifier })
      .orWhere('u.phone = :identifier', { identifier })
      .getOne();
  }
}
