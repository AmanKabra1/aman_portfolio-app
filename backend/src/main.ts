import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerInterceptor } from './common/logger/logger.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('Multi-tenant portfolio backend APIs')
    .setVersion('1.0')
    .addBearerAuth() // 🔥 IMPORTANT for JWT
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS configuration (matches Express setup)
  app.enableCors({
    origin: true, // Allow all origins (same as Express)
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global logger interceptor
  app.useGlobalInterceptors(new LoggerInterceptor());

  app.useStaticAssets(join(process.cwd(), 'uploads'));

  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  console.log(`Server running on http://localhost:${port}`);
  console.log('CORS enabled for all origins');
}

bootstrap();
