import cookieParser from 'cookie-parser';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { requestContext } from './common/context/request-context';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

const origins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.use((req, _res, next) => {
    requestContext.run({ requestId: req['requestId'] }, () => next());
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.NEST_PORT ?? 3000);
}
bootstrap();
