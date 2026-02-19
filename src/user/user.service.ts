import { Repository } from 'typeorm';

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { R2Service } from '../infra/r2/r2.service';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly r2Service: R2Service,
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

  async findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    return this.repo.findOne({
      where: { phone },
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

  async getUserInfo(userId: string): Promise<UserInfoDto> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserInfo(userId: string, dto: UpdateUserInfoDto): Promise<UserInfoDto> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.username !== undefined) {
      const existing = await this.repo.findOne({ where: { username: dto.username } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Username already taken');
      }
      user.username = dto.username;
    }

    if (dto.email !== undefined) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already taken');
      }
      user.email = dto.email;
    }

    if (dto.phone !== undefined) {
      const existing = await this.repo.findOne({ where: { phone: dto.phone } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Phone already taken');
      }
      user.phone = dto.phone;
    }

    await this.repo.save(user);
    return this.getUserInfo(userId);
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<UserInfoDto> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 删除旧头像（如果存在）
    if (user.avatarUrl) {
      const oldKey = this.r2Service.extractKeyFromUrl(user.avatarUrl);
      if (oldKey) {
        try {
          await this.r2Service.deleteFile(oldKey);
        } catch (error) {
          console.error('Failed to delete old avatar:', error);
        }
      }
    }

    // 上传新头像
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const key = `avatars/${userId}/${Date.now()}.${fileExtension}`;
    const avatarUrl = await this.r2Service.uploadFile(key, file.buffer, file.mimetype);

    // 更新用户记录
    user.avatarUrl = avatarUrl;
    await this.repo.save(user);

    return this.getUserInfo(userId);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.repo.update(userId, { passwordHash });
  }
}
