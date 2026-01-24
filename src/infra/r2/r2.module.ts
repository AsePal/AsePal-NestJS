import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import r2Config from '../../config/r2.config';
import { R2Service } from './r2.service';

@Module({
  imports: [ConfigModule.forFeature(r2Config)],
  providers: [R2Service],
  exports: [R2Service],
})
export class R2Module {}
