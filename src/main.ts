import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';   // or `import express from 'express'` if tsconfig fixed

const server = express.default(); // 👈 important fix

async function bootstrap(expressInstance: express.Express) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init(); // ❗ No app.listen() on Vercel
}

bootstrap(server);

export default server; // 👈 exported for Vercel
