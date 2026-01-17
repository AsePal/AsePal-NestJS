import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { requestContext } from './common/context/request-context';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(requestIdMiddleware);
  app.use((req, _res, next) => {
    requestContext.run({ requestId: req['requestId'] }, () => next());
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
