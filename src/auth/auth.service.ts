import * as bcrypt from 'bcrypt';

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(identifier: string, password: string) {
    const user = await this.users.findForLogin(identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // 可选：禁用用户
    if (user.isActive === false) throw new UnauthorizedException('User disabled');

    // 重要：返回时去掉 hash
    const { passwordHash, ...safeUser } = user as any;
    return safeUser;
  }

  async login(user: { id: string; username: string }) {
    const payload = { sub: user.id, username: user.username };
    return {
      accessToken: await this.jwt.signAsync(payload),
    };
  }

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.users.createUser({
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      });

      const { passwordHash: _, ...safeUser } = user as any;
      return safeUser;
    } catch (e: any) {
      // PostgreSQL 唯一约束错误
      if (e.code === '23505') {
        throw new ConflictException('User already exists');
      }
      throw e;
    }
  }
}
