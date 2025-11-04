import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,             // strip properties not in DTO
    forbidNonWhitelisted: true,  // throw error if unknown property
    transform: true,             // auto-transform payloads to DTO classes
  }));

  // ✅ Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000'], // frontend URL(s) allowed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ✅ Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Kanban API')
    .setDescription('API documentation for the Kanban project')
    .setVersion('1.0')
    .addTag('endpoints') // you can change/remove this
    .addBearerAuth() // if you use JWT auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Kanban API Docs',
  });

  // ✅ Start server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📘 Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
