import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { requestContext } from './common/context/request-context';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.use((req: Request & { requestId?: string }, _res: Response, next: NextFunction) => {
    requestContext.run({ requestId: req.requestId }, () => next());
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.NEST_PORT ?? 3000);
}
void bootstrap();
