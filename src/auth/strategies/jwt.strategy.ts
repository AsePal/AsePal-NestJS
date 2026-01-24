import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';

interface JwtPayload {
  sub: string;
  username: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    // 验证jti是否有效
    const isValid = await this.authService.validateJti(payload.jti, payload.sub);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or revoked token');
    }

    return { userId: payload.sub, username: payload.username, jti: payload.jti };
  }
}
