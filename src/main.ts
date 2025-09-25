import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // strip properties not in DTO
    forbidNonWhitelisted: true, // throw error if unknown property
    transform: true,        // auto-transform payloads to DTO classes
  }));
    app.enableCors({
    origin: ['http://localhost:3000'], // frontend URL(s) allowed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();