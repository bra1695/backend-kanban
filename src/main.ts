import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express = require('express');   // 👈 use require-style import (works always)

const server = express();              // 👈 now callable

async function bootstrap(expressInstance: express.Express) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init(); // ❗ no app.listen() in Vercel
}

bootstrap(server);

export default server;
