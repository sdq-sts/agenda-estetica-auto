import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TenantGuard } from './auth/tenant.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global guards (autenticação e multi-tenancy)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new TenantGuard(reflector));

  const port = process.env.PORT || 3333;
  await app.listen(port);

  console.log(`\n✅ Backend is running on: http://localhost:${port}/api`);
  console.log(`📚 Health check: http://localhost:${port}/api/health\n`);
}

bootstrap();
