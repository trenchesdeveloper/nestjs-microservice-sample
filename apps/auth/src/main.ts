import { NestFactory } from '@nestjs/core';
import { RmqService } from '@app/common';
import { AuthModule } from './auth.module';
import { RmqOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const rmqService = app.get<RmqService>(RmqService);

  app.connectMicroservice<RmqOptions>(rmqService.getOptions('AUTH', true));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
