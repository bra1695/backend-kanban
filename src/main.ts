import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = express();

async function createNestServer(expressInstance: express.Express) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors(); // allow CORS if frontend is separate
  await app.init(); // init Nest app (do NOT call listen)
  return app;
}

// Initialize NestJS once, then export serverless handler
let nestAppInitialized = false;

export default async function handler(req: any, res: any) {
  if (!nestAppInitialized) {
    await createNestServer(server);
    nestAppInitialized = true;
  }
  server(req, res); // now Express handles the request
}
