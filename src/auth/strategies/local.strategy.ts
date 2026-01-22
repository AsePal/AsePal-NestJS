import { Strategy } from 'passport-local';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: AuthService) {
    super({ usernameField: 'identifier', passwordField: 'password' });
  }

  async validate(identifier: string, password: string) {
    return this.auth.validateUser(identifier, password);
  }
}
