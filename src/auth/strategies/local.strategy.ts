import { Strategy } from 'passport-local';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import type { User } from '../../user/user.entity';
import { AuthService } from '../auth.service';

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: AuthService) {
    super({ usernameField: 'identifier', passwordField: 'password' });
  }

  async validate(identifier: string, password: string): Promise<SafeUser> {
    return this.auth.validateUser(identifier, password);
  }
}
