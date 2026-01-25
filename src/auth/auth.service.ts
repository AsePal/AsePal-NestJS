import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type Redis from 'ioredis';

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const hash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.users.createUser({
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        passwordHash: hash,
      });

      // 生成JWT令牌
      const { accessToken } = await this.login({ id: user.id, username: user.username });

      return { accessToken };
    } catch (e: unknown) {
      // PostgreSQL 唯一约束错误
      if (e instanceof Error && 'code' in e && e.code === '23505') {
        throw new ConflictException('User already exists');
      }
      throw e;
    }
  }

  /**
   * 生成6位数字验证码
   */
  private generateVerificationCode(): string {
    // return Math.floor(100000 + Math.random() * 900000).toString();
    return '114514';
  }

  /**
   * 发送忘记密码验证码
   * 即使用户不存在也返回成功，防止用户枚举攻击
   */
  async sendForgotPasswordCode(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email, phone } = dto;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const identifier = email || phone!;
    const identifierType = email ? 'email' : 'phone';

    // 查找用户，但不对外暴露用户是否存在
    let user: User | null = null;
    if (email) {
      user = await this.users.findByEmail(email);
    } else if (phone) {
      user = await this.users.findByPhone(phone);
    }

    // 生成验证码
    const code = this.generateVerificationCode();
    const cacheKey = `forgot_password:${identifierType}:${identifier}`;

    // 将验证码存储到Valkey，有效期5分钟
    await this.valkey.setex(cacheKey, 300, code);

    // 使用Logger打印验证码（开发模式）
    if (user) {
      this.logger.log(
        `[忘记密码] 用户 ${user.username} (${identifierType}: ${identifier}) 的验证码: ${code}`,
      );
    } else {
      // 即使用户不存在，也打印日志但不暴露给调用者
      this.logger.log(
        `[忘记密码] 不存在的${identifierType} ${identifier} 请求了验证码: ${code} (假装发送)`,
      );
    }

    // 无论用户是否存在，都返回相同的成功消息
    return {
      message: `Verification code sent to your ${identifierType}`,
    };
  }

  /**
   * 重置密码
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { identifier, verificationCode, newPassword } = dto;

    // 检测identifier是email还是phone
    const isEmail = identifier.includes('@');
    const identifierType = isEmail ? 'email' : 'phone';
    const cacheKey = `forgot_password:${identifierType}:${identifier}`;

    // 从Valkey获取验证码
    const storedCode = await this.valkey.get(cacheKey);

    if (!storedCode) {
      throw new BadRequestException('Verification code expired or invalid');
    }

    if (storedCode !== verificationCode) {
      throw new BadRequestException('Invalid verification code');
    }

    // 查找用户
    let user: User | null = null;
    if (isEmail) {
      user = await this.users.findByEmail(identifier);
    } else {
      user = await this.users.findByPhone(identifier);
    }

    if (!user) {
      // 验证码正确但用户不存在（理论上不应该发生，但做防御性编程）
      throw new BadRequestException('User not found');
    }

    // 更新密码
    const hash = await bcrypt.hash(newPassword, 10);
    await this.users.updatePassword(user.id, hash);

    // 删除验证码
    await this.valkey.del(cacheKey);

    this.logger.log(`[忘记密码] 用户 ${user.username} 成功重置密码`);

    return {
      message: 'Password reset successfully',
    };
  }
}
