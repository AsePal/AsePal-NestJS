import type { Response } from 'express';

import { Body, Controller, Post, Request, Res, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

interface AuthenticatedRequest {
  user: { id: string; username: string; jti?: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() _dto: LoginDto, @Request() req: AuthenticatedRequest) {
    return this.auth.login(req.user);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.register(dto);

    const { accessToken } = await this.auth.login(user);

    res.status(201).cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: AuthenticatedRequest) {
    if (req.user.jti) {
      await this.auth.revokeToken(req.user.jti);
    }
    return { message: 'Logged out successfully' };
  }
}
