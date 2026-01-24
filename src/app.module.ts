import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { LoggerModule } from './common/logger/logger.module';
import { valkeyConfig } from './config/valkey.config';
import { HealthModule } from './health/health.module';
import { ValkeyModule } from './infra/valkey/valkey.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [valkeyConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      autoLoadEntities: true,
      synchronize: true,
    }),
    ChatModule,
    ValkeyModule,
    ConfigModule,
    HealthModule,
    LoggerModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
