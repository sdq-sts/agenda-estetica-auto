# 🚀 TASKS PARA HOJE - 14/01/2026

> **Objetivo:** Implementar fundação SaaS (Autenticação + Multi-tenancy)
> **Tempo estimado:** 8 horas
> **Resultado:** Aplicação com login e dados isolados por tenant

---

## ☕ MANHÃ (4h) - Autenticação Básica

### Task 1: Setup Prisma com Tenant + User (1.5h)

**1.1 Backup do banco atual**
```bash
cd backend
cp prisma/dev.db prisma/dev.db.backup
```

**1.2 Editar `backend/prisma/schema.prisma`**

Adicionar ANTES do model `Cliente`:
```prisma
model Tenant {
  id               String   @id @default(cuid())
  nome             String
  slug             String   @unique
  whatsapp         String?
  email            String   @unique
  plano            String   @default("FREE") // FREE, BASIC, PRO, ENTERPRISE
  ativo            Boolean  @default(true)
  stripeCustomerId String?  @unique
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  usuarios         User[]
  clientes         Cliente[]
  veiculos         Veiculo[]
  servicos         Servico[]
  agendamentos     Agendamento[]
  bloqueios        BloqueioHorario[]
  configuracoes    Configuracao[]
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  senha     String   // bcrypt hash
  nome      String
  role      String   @default("ATENDENTE") // OWNER, ADMIN, ATENDENTE
  ativo     Boolean  @default(true)
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
}
```

**1.3 Adicionar `tenantId` nos models existentes**

Em CADA model (Cliente, Veiculo, Servico, Agendamento, BloqueioHorario, Configuracao), adicionar:
```prisma
tenantId  String
tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

@@index([tenantId])
```

Exemplo no model Cliente:
```prisma
model Cliente {
  id           String   @id @default(cuid())
  nome         String
  telefone     String
  whatsapp     String?
  email        String?
  cpfCnpj      String?
  observacoes  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenantId     String   // NOVO
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade) // NOVO

  veiculos     Veiculo[]
  agendamentos Agendamento[]

  @@unique([tenantId, telefone]) // ALTERAR de @@unique([telefone])
  @@unique([tenantId, email])    // ALTERAR de @@unique([email])
  @@index([tenantId])            // NOVO
}
```

**IMPORTANTE:** Fazer isso em TODOS os models!

**1.4 Gerar migration**
```bash
npx prisma migrate dev --name add-multi-tenancy
npx prisma generate
```

---

### Task 2: Criar Tenant Default + Seed (1h)

**2.1 Criar arquivo `backend/prisma/seed-tenant.ts`**
```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Criar tenant demo
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      nome: 'Lava-Jato Demo',
      slug: 'demo',
      email: 'contato@demo.com',
      whatsapp: '11999999999',
      plano: 'FREE',
      ativo: true,
    },
  });

  console.log('✅ Tenant criado:', tenant.slug);

  // 2. Criar usuário admin
  const senhaHash = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      senha: senhaHash,
      nome: 'Administrador',
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Usuário criado:', user.email);

  // 3. Atualizar dados existentes (se houver)
  const clientes = await prisma.cliente.findMany({ where: { tenantId: null } });
  if (clientes.length > 0) {
    console.log(`📦 Migrando ${clientes.length} clientes para tenant demo...`);
    await prisma.cliente.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id },
    });
  }

  const veiculos = await prisma.veiculo.findMany({ where: { tenantId: null } });
  if (veiculos.length > 0) {
    console.log(`📦 Migrando ${veiculos.length} veículos...`);
    await prisma.veiculo.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id },
    });
  }

  const servicos = await prisma.servico.findMany({ where: { tenantId: null } });
  if (servicos.length > 0) {
    console.log(`📦 Migrando ${servicos.length} serviços...`);
    await prisma.servico.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id },
    });
  }

  const agendamentos = await prisma.agendamento.findMany({ where: { tenantId: null } });
  if (agendamentos.length > 0) {
    console.log(`📦 Migrando ${agendamentos.length} agendamentos...`);
    await prisma.agendamento.updateMany({
      where: { tenantId: null },
      data: { tenantId: tenant.id },
    });
  }

  console.log('🎉 Seed completo!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**2.2 Adicionar script no `package.json`**
```json
"scripts": {
  "seed": "ts-node prisma/seed-tenant.ts"
}
```

**2.3 Instalar bcrypt**
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

**2.4 Rodar seed**
```bash
npm run seed
```

**✅ Checkpoint:** Deve aparecer "Tenant criado: demo" e "Usuário criado: admin@demo.com"

---

### Task 3: Módulo Auth Básico (1.5h)

**3.1 Instalar dependências**
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt
```

**3.2 Criar estrutura de arquivos**
```bash
mkdir -p src/auth
touch src/auth/auth.module.ts
touch src/auth/auth.controller.ts
touch src/auth/auth.service.ts
touch src/auth/jwt.strategy.ts
mkdir -p src/auth/dto
touch src/auth/dto/login.dto.ts
```

**3.3 Criar `src/auth/dto/login.dto.ts`**
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;
}
```

**3.4 Criar `src/auth/jwt.strategy.ts`**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { tenant: true },
    });

    if (!user || !user.ativo || !user.tenant.ativo) {
      throw new UnauthorizedException('Usuário ou tenant inativo');
    }

    return {
      userId: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
    };
  }
}
```

**3.5 Criar `src/auth/auth.service.ts`**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, user.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.ativo || !user.tenant.ativo) {
      throw new UnauthorizedException('Usuário ou tenant inativo');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        tenant: {
          id: user.tenant.id,
          nome: user.tenant.nome,
          slug: user.tenant.slug,
          plano: user.tenant.plano,
        },
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });
  }
}
```

**3.6 Criar `src/auth/auth.controller.ts`**
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

**3.7 Criar `src/auth/auth.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**3.8 Importar no `src/app.module.ts`**
```typescript
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule, // ADICIONAR
    ClientesModule,
    VeiculosModule,
    // ... resto
  ],
})
```

**3.9 Testar com curl/Insomnia**
```bash
# Fazer login
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","senha":"admin123"}'

# Deve retornar:
# {
#   "access_token": "eyJhbGc...",
#   "user": { ... }
# }
```

**✅ Checkpoint:** Login funcionando e retornando JWT!

---

## 🌮 TARDE (4h) - Isolamento de Dados

### Task 4: Criar TenantGuard (1h)

**4.1 Criar `src/auth/tenant.guard.ts`**
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Se não tem usuário, deixar passar (AuthGuard vai bloquear)
    if (!request.user) {
      return true;
    }

    // Injetar tenantId no request para uso nos services
    request.tenantId = request.user.tenantId;

    return true;
  }
}
```

**4.2 Criar `src/auth/jwt-auth.guard.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**4.3 Aplicar guards globalmente no `src/main.ts`**
```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TenantGuard } from './auth/tenant.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  // Aplicar guards globalmente
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new TenantGuard(reflector));

  await app.listen(3333);
  console.log('🚀 Backend rodando em http://localhost:3333');
}
bootstrap();
```

**4.4 Permitir rotas públicas com decorator**

Criar `src/auth/public.decorator.ts`:
```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Atualizar `jwt-auth.guard.ts`:
```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

**4.5 Marcar rota de login como pública**

No `auth.controller.ts`:
```typescript
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // ADICIONAR
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

**✅ Checkpoint:** Testar que rotas sem token retornam 401, exceto `/auth/login`

---

### Task 5: Atualizar Services para Filtrar por Tenant (2h)

**5.1 Atualizar `src/clientes/clientes.service.ts`**

Adicionar `tenantId` em TODOS os métodos:

```typescript
async findAll(paginationDto: PaginationDto, tenantId: string) {
  const { page = 1, limit = 10 } = paginationDto;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.cliente.findMany({
      where: { tenantId }, // ADICIONAR
      skip,
      take: limit,
      include: {
        _count: {
          select: { veiculos: true, agendamentos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.cliente.count({ where: { tenantId } }), // ADICIONAR
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async findOne(id: string, tenantId: string) {
  return this.prisma.cliente.findFirst({
    where: { id, tenantId }, // ADICIONAR tenantId
    include: {
      veiculos: true,
      agendamentos: true,
    },
  });
}

async create(createClienteDto: CreateClienteDto, tenantId: string) {
  return this.prisma.cliente.create({
    data: {
      ...createClienteDto,
      tenantId, // ADICIONAR
    },
  });
}

async update(id: string, updateClienteDto: UpdateClienteDto, tenantId: string) {
  // Verificar se pertence ao tenant
  const cliente = await this.findOne(id, tenantId);
  if (!cliente) {
    throw new NotFoundException('Cliente não encontrado');
  }

  return this.prisma.cliente.update({
    where: { id },
    data: updateClienteDto,
  });
}

async remove(id: string, tenantId: string) {
  // Verificar se pertence ao tenant
  const cliente = await this.findOne(id, tenantId);
  if (!cliente) {
    throw new NotFoundException('Cliente não encontrado');
  }

  // ... resto do código
}
```

**5.2 Atualizar `src/clientes/clientes.controller.ts`**

Injetar `tenantId` do request:

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() createClienteDto: CreateClienteDto, @Request() req) {
    return this.clientesService.create(createClienteDto, req.tenantId);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Request() req) {
    return this.clientesService.findAll(paginationDto, req.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.clientesService.findOne(id, req.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto, @Request() req) {
    return this.clientesService.update(id, updateClienteDto, req.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.clientesService.remove(id, req.tenantId);
  }
}
```

**5.3 Repetir para outros modules**

Aplicar a mesma lógica em:
- `veiculos.service.ts` + `veiculos.controller.ts`
- `servicos.service.ts` + `servicos.controller.ts`
- `agendamentos.service.ts` + `agendamentos.controller.ts`
- `bloqueios.service.ts` + `bloqueios.controller.ts`
- `configuracoes.service.ts` + `configuracoes.controller.ts`

**Padrão:**
1. Adicionar parâmetro `tenantId: string` em todos os métodos do service
2. Adicionar `where: { tenantId }` em todos os `findMany`/`findFirst`/`count`
3. Adicionar `tenantId` no `data` do `create`
4. Verificar tenant no `update` e `remove`
5. Injetar `@Request() req` no controller
6. Passar `req.tenantId` para o service

**✅ Checkpoint:** Todos os endpoints devem requerer autenticação e filtrar por tenant

---

### Task 6: Frontend - Página de Login (1h)

**6.1 Criar estrutura**
```bash
cd frontend
mkdir -p app/\(auth\)/login
touch app/\(auth\)/login/page.tsx
touch app/\(auth\)/layout.tsx
```

**6.2 Criar `app/(auth)/layout.tsx`**
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-6">
      {children}
    </div>
  );
}
```

**6.3 Criar `app/(auth)/login/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3333/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await res.json();

      // Salvar token e usuário
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirecionar para dashboard
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-outfit font-bold text-gray-900 mb-2">
          Agenda Estética Auto
        </h1>
        <p className="text-gray-600">
          Faça login para acessar o sistema
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px]"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Credenciais de teste:</p>
        <p className="font-mono text-xs mt-1">
          admin@demo.com / admin123
        </p>
      </div>
    </div>
  );
}
```

**6.4 Criar helper `lib/auth.ts`**
```typescript
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
```

**6.5 Atualizar `lib/api.ts`**

Adicionar header Authorization:

```typescript
import { getToken } from './auth';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }), // ADICIONAR
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Se 401, redirecionar para login
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Não autenticado');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// ... resto igual
```

**6.6 Proteger rotas no `app/layout.tsx`**

Adicionar redirect se não autenticado:

```typescript
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Rotas públicas
    const publicRoutes = ['/login', '/register'];

    if (!publicRoutes.includes(pathname) && !isAuthenticated()) {
      router.push('/login');
    }
  }, [pathname, router]);

  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

**✅ Checkpoint:** Acessar http://localhost:3000 deve redirecionar para /login

---

## 🌙 NOITE (Opcional - 2h) - Validação

### Task 7: Testar Multi-tenancy (2h)

**7.1 Criar segundo tenant**

Editar `backend/prisma/seed-tenant.ts` e adicionar:

```typescript
// Adicionar após criar primeiro tenant

const tenant2 = await prisma.tenant.create({
  data: {
    nome: 'Lava-Jato Concorrente',
    slug: 'concorrente',
    email: 'contato@concorrente.com',
    plano: 'FREE',
  },
});

const senhaHash2 = await bcrypt.hash('admin123', 10);

await prisma.user.create({
  data: {
    email: 'admin@concorrente.com',
    senha: senhaHash2,
    nome: 'Admin Concorrente',
    role: 'OWNER',
    tenantId: tenant2.id,
  },
});

console.log('✅ Segundo tenant criado');
```

Rodar: `npm run seed`

**7.2 Criar clientes para cada tenant**

Via Insomnia/Postman:

1. Fazer login com `admin@demo.com`
2. Criar cliente "João Silva"
3. Fazer login com `admin@concorrente.com`
4. Criar cliente "Maria Santos"

**7.3 Verificar isolamento**

1. Fazer login com `admin@demo.com`
2. `GET /api/clientes` → Deve retornar APENAS "João Silva"
3. Fazer login com `admin@concorrente.com`
4. `GET /api/clientes` → Deve retornar APENAS "Maria Santos"

**✅ SUCCESS:** Se cada tenant vê apenas seus dados, multi-tenancy está funcionando! 🎉

---

## 📊 CUSTO FLY.IO (Respondendo sua pergunta)

### Para 1 Cliente (Tenant)

**Infraestrutura Base:**
```
Backend API (NestJS):
  Máquina: shared-cpu-1x (256MB RAM)
  Custo: $1.94/mês = R$ 10/mês

PostgreSQL:
  1º banco: GRÁTIS (Fly.io oferece 1 DB free)
  Após isso: $7/mês = R$ 35/mês
  Custo: R$ 0/mês (primeiro cliente)

Evolution API (WhatsApp):
  Máquina: shared-cpu-1x (512MB RAM)
  Custo: $1.94/mês = R$ 10/mês
  (Compartilhado entre todos os tenants)

Frontend (Next.js):
  Vercel: GRÁTIS (até 100GB bandwidth)
  Ou Fly.io: $1.94/mês = R$ 10/mês
  Custo: R$ 0/mês (usando Vercel)
```

**TOTAL FIXO:** R$ 20/mês (backend + WhatsApp)

**Custos Variáveis:**
```
Claude API:
  - 100 conversas/mês = ~500k tokens
  - Custo: $2-5/mês = R$ 10-25/mês por tenant

Stripe (taxa sobre pagamento):
  - 4.99% + R$ 0.39 por transação
  - Se cliente paga R$ 49: você paga R$ 2.84
  - Efetivamente desconto do que você recebe
```

### RESUMO: Custo por Cliente

**1 cliente (tenant):**
- Infra fixa: R$ 20/mês (dividido entre todos)
- Claude API: R$ 10-25/mês
- **Custo total: R$ 10-25/mês por cliente**
- **Receita: R$ 49/mês (plano BASIC)**
- **Lucro: R$ 24-39/mês por cliente** 💰

**Breakeven:** Você lucra desde o PRIMEIRO cliente!

**10 clientes:**
- Infra: R$ 20/mês (mesma)
- Claude API: R$ 100-250/mês
- **Custo: R$ 120-270/mês**
- **Receita: R$ 490/mês**
- **Lucro: R$ 220-370/mês** 🤑

**100 clientes:**
- Infra: R$ 50/mês (upgrade leve)
- Claude API: R$ 1.000-2.500/mês
- **Custo: R$ 1.050-2.550/mês**
- **Receita: R$ 4.900/mês**
- **Lucro: R$ 2.350-3.850/mês** 🚀

**Margem de lucro:** 50-80% (excelente para SaaS!)

---

## ✅ CHECKLIST FINAL DO DIA

Ao final do dia você deve ter:

- [ ] Prisma com models Tenant e User
- [ ] Campo tenantId em todos os models
- [ ] Seed rodado com tenant "demo" e usuário admin
- [ ] Módulo auth com JWT funcionando
- [ ] TenantGuard filtrando dados por tenant
- [ ] Todos os services atualizados com tenantId
- [ ] Página de login no frontend funcionando
- [ ] Token JWT sendo enviado nas requests
- [ ] Multi-tenancy validado (2 tenants, dados isolados)

**Resultado:** Aplicação com login seguro e dados isolados! 🎉

**Próximo passo (amanhã):** Portal do Cliente (rota pública para agendamento)

---

**Boa sorte!** 💪
