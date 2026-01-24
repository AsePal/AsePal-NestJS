import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type Redis from 'ioredis';

import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
    @Inject('VALKEY') private readonly valkey: Redis,
    private readonly config: ConfigService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<SafeUser> {
    const user = await this.users.findForLogin(identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // 可选：禁用用户
    if (user.isActive === false) throw new UnauthorizedException('User disabled');

    // 重要：返回时去掉 hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async login(user: { id: string; username: string }) {
    const jti = randomUUID();
    const payload = { sub: user.id, username: user.username, jti };

    // 将jti存储到Valkey，过期时间与JWT一致
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '7d';
    const ttlSeconds = this.parseExpiresIn(expiresIn);
    await this.valkey.setex(`jwt:${jti}`, ttlSeconds, user.id);

    return {
      accessToken: await this.jwt.signAsync(payload),
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60; // 默认7天

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }

  async validateJti(jti: string, userId: string): Promise<boolean> {
    const storedUserId = await this.valkey.get(`jwt:${jti}`);
    return storedUserId === userId;
  }

  async revokeToken(jti: string): Promise<void> {
    await this.valkey.del(`jwt:${jti}`);
  }

  async register(dto: RegisterDto): Promise<SafeUser> {
    const hash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.users.createUser({
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        passwordHash: hash,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    } catch (e: unknown) {
      // PostgreSQL 唯一约束错误
      if (e instanceof Error && 'code' in e && e.code === '23505') {
        throw new ConflictException('User already exists');
      }
      throw e;
    }
  }
}
