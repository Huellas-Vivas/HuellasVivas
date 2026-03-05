import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';
import { printBanner } from './common/utils/banner';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  printBanner();
  const app = await NestFactory.create(AppModule);

  // Security Middleware
  app.use(helmet());
  app.use(compression());

  // CORS config
  app.enableCors({
    origin: (process.env.ALLOWED_ORIGINS as string).split(','),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global Routing
  app.setGlobalPrefix('api/v1');

  // Input Validation Pipe Config
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Default Filter and Interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger Setting Up
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Huellas Vivas API')
    .setDescription('REST API for the Huellas Vivas donation platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
