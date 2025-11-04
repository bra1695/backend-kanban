import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
const app = await NestFactory.create<NestExpressApplication>(AppModule);

// ✅ Serve Swagger UI static files (fixes SwaggerUIBundle undefined)
app.useStaticAssets(join(__dirname, '..', 'node_modules', 'swagger-ui-dist'));

// ✅ Global validation pipe
app.useGlobalPipes(
new ValidationPipe({
whitelist: true,
forbidNonWhitelisted: true,
transform: true,
}),
);

// ✅ Enable CORS
app.enableCors({
origin: ['http://localhost:3000'],
methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
credentials: true,
});

// ✅ Disable caching for Swagger UI
app.use('/api/docs', (req, res, next) => {
res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
next();
});

// ✅ Swagger configuration
const config = new DocumentBuilder()
.setTitle('Kanban API')
.setDescription('API documentation for the Kanban project')
.setVersion('1.0')
.addTag('endpoints')
.addBearerAuth()
.build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
swaggerOptions: { persistAuthorization: true },
customSiteTitle: 'Kanban API Docs',
});

const port = process.env.PORT ?? 3000;
await app.listen(port);
console.log(`🚀 Server running on http://localhost:${port}`);
console.log(`📘 Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
