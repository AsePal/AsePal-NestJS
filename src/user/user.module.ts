import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { R2Module } from '../infra/r2/r2.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), R2Module],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
