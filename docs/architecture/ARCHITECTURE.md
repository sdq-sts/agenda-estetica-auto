# 🏗️ Arquitetura do Sistema - Agendamento Estética Automotiva

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Diagrama de Arquitetura](#diagrama-de-arquitetura)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Padrões e Convenções](#padrões-e-convenções)
8. [Segurança](#segurança)
9. [Performance](#performance)

---

## 🎯 Visão Geral

### Stack Completa

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE                             │
│  Browser (Desktop/Mobile) + PWA                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                     │
│  - SSR/SSG Pages                                        │
│  - React Components (shadcn/ui)                         │
│  - Tailwind CSS                                         │
│  - Client State Management                              │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (NestJS)                       │
│  - Controllers (HTTP)                                   │
│  - Services (Business Logic)                            │
│  - Prisma (ORM)                                         │
│  - Validation & Guards                                  │
└────────────────────┬────────────────────────────────────┘
                     │ Prisma Client
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE                              │
│  Fase 1: SQLite (local dev)                            │
│  Fase 2: PostgreSQL (Supabase)                         │
└─────────────────────────────────────────────────────────┘
```

### Separação de Responsabilidades

**Frontend (Next.js):**
- Renderização de UI
- Gerenciamento de estado local
- Validação de formulários (client-side)
- Otimização de imagens e assets
- SEO e performance

**Backend (NestJS):**
- Lógica de negócio
- Validação de dados (server-side)
- Autenticação e autorização
- Acesso ao banco de dados
- APIs REST

**Database (SQLite → PostgreSQL):**
- Persistência de dados
- Integridade referencial
- Queries otimizadas

---

## 📊 Diagrama de Arquitetura

### Arquitetura de Camadas (Layered Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                    │
│                      (Next.js)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Pages   │  │Components│  │  Hooks   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   API LAYER (NestJS)                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │            Controllers                           │  │
│  │  - Validação de entrada                         │  │
│  │  - Serialização de resposta                     │  │
│  │  - HTTP Status codes                            │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│                   ▼                                     │
│  ┌─────────────────────────────────────────────────┐  │
│  │         Business Logic Layer                     │  │
│  │              (Services)                          │  │
│  │  - Regras de negócio                            │  │
│  │  - Validações complexas                         │  │
│  │  - Orquestração de operações                    │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│                   ▼                                     │
│  ┌─────────────────────────────────────────────────┐  │
│  │          Data Access Layer                       │  │
│  │            (Prisma Service)                      │  │
│  │  - CRUD operations                               │  │
│  │  - Queries                                       │  │
│  │  - Transactions                                  │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                            │
│                 (SQLite/PostgreSQL)                     │
└─────────────────────────────────────────────────────────┘
```

### Comunicação Entre Camadas

```
Frontend Request Flow:
User Action → Component → API Call (fetch) → Backend Endpoint

Backend Processing Flow:
Controller → DTO Validation → Service → Prisma → Database
                ↓                                      ↓
           Response ← Business Logic ← Data ← Query Result
```

---

## 📁 Estrutura de Pastas

### Visão Geral do Projeto

```
agenda-estetica-auto/
├── backend/                    # API NestJS
├── frontend/                   # App Next.js
├── docs/                       # Documentação adicional
├── ARCHITECTURE.md            # Este documento
├── API-SPEC.md                # Especificação da API
├── DESIGN-SYSTEM.md           # Design System
├── REQUIREMENTS.md            # Requisitos
├── SETUP-GUIDE.md             # Guia de setup
├── .gitignore
└── README.md
```

### Backend (NestJS) - Estrutura Detalhada

```
backend/
├── src/
│   ├── main.ts                      # Entry point da aplicação
│   │
│   ├── app.module.ts                # Módulo raiz
│   ├── app.controller.ts            # Controller raiz (health check)
│   ├── app.service.ts               # Service raiz
│   │
│   ├── prisma/                      # Módulo Prisma (Global)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts        # Singleton do PrismaClient
│   │
│   ├── common/                      # Código compartilhado
│   │   ├── decorators/              # Decorators customizados
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/                  # Guards de autenticação
│   │   │   ├── auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/            # Interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── filters/                 # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/                   # Pipes de validação
│   │   │   └── validation.pipe.ts
│   │   └── dto/                     # DTOs compartilhados
│   │       ├── pagination.dto.ts
│   │       └── response.dto.ts
│   │
│   ├── clientes/                    # Módulo Clientes
│   │   ├── clientes.module.ts
│   │   ├── clientes.controller.ts   # Endpoints de clientes
│   │   ├── clientes.service.ts      # Lógica de negócio
│   │   ├── dto/
│   │   │   ├── create-cliente.dto.ts
│   │   │   ├── update-cliente.dto.ts
│   │   │   └── cliente-response.dto.ts
│   │   └── entities/
│   │       └── cliente.entity.ts    # Interface/Type do Cliente
│   │
│   ├── veiculos/                    # Módulo Veículos
│   │   ├── veiculos.module.ts
│   │   ├── veiculos.controller.ts
│   │   ├── veiculos.service.ts
│   │   ├── dto/
│   │   │   ├── create-veiculo.dto.ts
│   │   │   └── update-veiculo.dto.ts
│   │   └── entities/
│   │       └── veiculo.entity.ts
│   │
│   ├── servicos/                    # Módulo Serviços
│   │   ├── servicos.module.ts
│   │   ├── servicos.controller.ts
│   │   ├── servicos.service.ts
│   │   ├── dto/
│   │   │   ├── create-servico.dto.ts
│   │   │   └── update-servico.dto.ts
│   │   └── entities/
│   │       └── servico.entity.ts
│   │
│   ├── agendamentos/                # Módulo Agendamentos
│   │   ├── agendamentos.module.ts
│   │   ├── agendamentos.controller.ts
│   │   ├── agendamentos.service.ts
│   │   ├── dto/
│   │   │   ├── create-agendamento.dto.ts
│   │   │   ├── update-agendamento.dto.ts
│   │   │   └── horarios-disponiveis.dto.ts
│   │   └── entities/
│   │       └── agendamento.entity.ts
│   │
│   ├── auth/                        # Módulo Autenticação (Fase 2)
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── notificacoes/                # Módulo Notificações (Fase 3)
│   │   ├── notificacoes.module.ts
│   │   ├── notificacoes.controller.ts
│   │   ├── notificacoes.service.ts
│   │   └── dto/
│   │       └── send-notification.dto.ts
│   │
│   ├── webhooks/                    # Módulo Webhooks WhatsApp (Fase 4)
│   │   ├── webhooks.module.ts
│   │   ├── webhooks.controller.ts
│   │   └── webhooks.service.ts
│   │
│   └── config/                      # Configurações
│       ├── database.config.ts
│       ├── app.config.ts
│       └── validation.config.ts
│
├── prisma/                          # Prisma ORM
│   ├── schema.prisma                # Schema do banco
│   ├── migrations/                  # Migrations
│   │   └── 20260112_init/
│   ├── seed.ts                      # Seed data
│   └── dev.db                       # SQLite database (gitignored)
│
├── test/                            # Testes E2E
│   ├── app.e2e-spec.ts
│   ├── clientes.e2e-spec.ts
│   └── agendamentos.e2e-spec.ts
│
├── .env                             # Variáveis de ambiente (gitignored)
├── .env.example                     # Template de variáveis
├── nest-cli.json                    # Config NestJS CLI
├── tsconfig.json                    # TypeScript config
├── tsconfig.build.json              # Build config
├── package.json
└── README.md
```

### Frontend (Next.js) - Estrutura Detalhada

```
frontend/
├── src/
│   ├── app/                         # App Router (Next.js 14+)
│   │   ├── layout.tsx               # Layout raiz
│   │   ├── page.tsx                 # Dashboard (/)
│   │   ├── globals.css              # Estilos globais
│   │   ├── loading.tsx              # Loading state global
│   │   ├── error.tsx                # Error boundary global
│   │   │
│   │   ├── (auth)/                  # Grupo de rotas de autenticação
│   │   │   ├── layout.tsx           # Layout sem bottom nav
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Página de login
│   │   │   └── register/
│   │   │       └── page.tsx         # Página de registro
│   │   │
│   │   ├── (dashboard)/             # Grupo de rotas autenticadas
│   │   │   ├── layout.tsx           # Layout com bottom nav
│   │   │   │
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx         # Lista de clientes
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx     # Detalhe do cliente
│   │   │   │   └── novo/
│   │   │   │       └── page.tsx     # Novo cliente
│   │   │   │
│   │   │   ├── veiculos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── servicos/
│   │   │   │   ├── page.tsx         # Catálogo de serviços
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Detalhe do serviço
│   │   │   │
│   │   │   ├── agenda/
│   │   │   │   ├── page.tsx         # Calendário/agenda
│   │   │   │   └── [date]/
│   │   │   │       └── page.tsx     # Agenda de um dia específico
│   │   │   │
│   │   │   ├── agendamentos/
│   │   │   │   ├── page.tsx         # Lista de agendamentos
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx     # Detalhe do agendamento
│   │   │   │   │   └── editar/
│   │   │   │   │       └── page.tsx # Editar agendamento
│   │   │   │   └── novo/
│   │   │   │       └── page.tsx     # Criar agendamento
│   │   │   │
│   │   │   └── configuracoes/
│   │   │       ├── page.tsx         # Configurações gerais
│   │   │       ├── perfil/
│   │   │       │   └── page.tsx
│   │   │       └── horarios/
│   │   │           └── page.tsx     # Config horário funcionamento
│   │   │
│   │   └── api/                     # API Routes (opcional - proxy)
│   │       └── [...path]/
│   │           └── route.ts         # Proxy para backend
│   │
│   ├── components/                  # Componentes React
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── dropdown-menu.tsx
│   │   │
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── Header.tsx           # Header principal
│   │   │   ├── BottomNav.tsx        # Navegação inferior mobile
│   │   │   ├── Sidebar.tsx          # Sidebar desktop
│   │   │   └── Container.tsx        # Container wrapper
│   │   │
│   │   ├── clientes/                # Componentes de clientes
│   │   │   ├── ClienteCard.tsx
│   │   │   ├── ClienteList.tsx
│   │   │   ├── ClienteForm.tsx
│   │   │   └── ClienteSearch.tsx
│   │   │
│   │   ├── veiculos/
│   │   │   ├── VeiculoCard.tsx
│   │   │   └── VeiculoForm.tsx
│   │   │
│   │   ├── servicos/
│   │   │   ├── ServicoCard.tsx
│   │   │   ├── ServicoList.tsx
│   │   │   └── ServicoCategoryFilter.tsx
│   │   │
│   │   ├── agendamentos/
│   │   │   ├── AgendamentoCard.tsx
│   │   │   ├── AgendamentoForm.tsx
│   │   │   ├── AgendamentoCalendar.tsx
│   │   │   ├── HorarioSelector.tsx
│   │   │   └── StatusBadge.tsx
│   │   │
│   │   ├── shared/                  # Componentes compartilhados
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── SearchInput.tsx
│   │   │
│   │   └── providers/               # Context providers
│   │       ├── AuthProvider.tsx
│   │       ├── ThemeProvider.tsx
│   │       └── ToastProvider.tsx
│   │
│   ├── lib/                         # Utilitários e helpers
│   │   ├── api.ts                   # Cliente API (fetch wrapper)
│   │   ├── utils.ts                 # Funções utilitárias (cn, etc)
│   │   ├── supabase.ts              # Cliente Supabase (Fase 2)
│   │   ├── validations.ts           # Validações compartilhadas
│   │   └── constants.ts             # Constantes da aplicação
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   ├── useClientes.ts
│   │   ├── useVeiculos.ts
│   │   ├── useServicos.ts
│   │   ├── useAgendamentos.ts
│   │   ├── useAuth.ts               # Hook de autenticação
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── types/                       # TypeScript types/interfaces
│   │   ├── cliente.ts
│   │   ├── veiculo.ts
│   │   ├── servico.ts
│   │   ├── agendamento.ts
│   │   ├── api.ts                   # Tipos de resposta da API
│   │   └── index.ts                 # Barrel export
│   │
│   └── styles/                      # Estilos adicionais (se necessário)
│       └── fonts/                   # Fontes customizadas
│
├── public/                          # Assets estáticos
│   ├── favicon.ico
│   ├── logo.svg
│   ├── images/
│   └── icons/
│
├── .env.local                       # Variáveis de ambiente (gitignored)
├── .env.example                     # Template de variáveis
├── next.config.mjs                  # Config Next.js
├── tailwind.config.ts               # Config Tailwind
├── postcss.config.mjs               # Config PostCSS
├── tsconfig.json                    # TypeScript config
├── components.json                  # shadcn/ui config
├── package.json
└── README.md
```

---

## 🔧 Backend Architecture

### Módulos NestJS

#### 1. App Module (Raiz)

```typescript
// src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,        // Global module
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    AgendamentosModule,
    // AuthModule,       // Fase 2
    // NotificacoesModule, // Fase 3
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### 2. Prisma Module (Global)

```typescript
// src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// src/prisma/prisma.module.ts
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

#### 3. Feature Module Pattern

Cada módulo de feature (Clientes, Veículos, etc.) segue o mesmo padrão:

```typescript
// Exemplo: src/clientes/clientes.module.ts
@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService], // Exportar se outros módulos precisarem
})
export class ClientesModule {}
```

### Camadas de Responsabilidade

#### Controller Layer
**Responsabilidades:**
- Receber requisições HTTP
- Validar DTOs (class-validator)
- Delegar para Services
- Retornar respostas HTTP formatadas
- Aplicar Guards e Interceptors

```typescript
@Controller('clientes')
@UseGuards(AuthGuard) // Fase 2
@UseInterceptors(LoggingInterceptor)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.clientesService.findAll(paginationDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }
}
```

#### Service Layer
**Responsabilidades:**
- Implementar lógica de negócio
- Validações complexas
- Orquestrar operações
- Lidar com transações
- Tratar erros de negócio

```typescript
@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        skip,
        take: limit,
        include: { veiculos: true, _count: { select: { agendamentos: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cliente.count(),
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

  async create(createClienteDto: CreateClienteDto) {
    // Validação: Verificar se telefone já existe
    const existente = await this.prisma.cliente.findUnique({
      where: { telefone: createClienteDto.telefone },
    });

    if (existente) {
      throw new ConflictException('Telefone já cadastrado');
    }

    return this.prisma.cliente.create({
      data: createClienteDto,
    });
  }
}
```

#### DTO Layer
**Responsabilidades:**
- Definir estrutura de dados de entrada/saída
- Validações usando class-validator
- Transformações usando class-transformer
- Documentação Swagger

```typescript
// src/clientes/dto/create-cliente.dto.ts
export class CreateClienteDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nome: string;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Telefone inválido' })
  telefone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cpfCnpj?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
```

### Validação e Error Handling

```typescript
// src/common/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

### Guards e Interceptors

```typescript
// src/common/guards/auth.guard.ts (Fase 2)
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}

// src/common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        console.log(`${method} ${url} - ${responseTime}ms`);
      }),
    );
  }
}
```

---

## ⚛️ Frontend Architecture

### Next.js App Router

**Estrutura de Rotas:**
- `app/` - Pasta raiz do App Router
- Arquivos especiais: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`
- Route Groups: `(auth)`, `(dashboard)` para layouts diferentes
- Dynamic Routes: `[id]` para rotas dinâmicas

### Component Architecture

#### Hierarquia de Componentes

```
App
├── RootLayout (layout.tsx)
│   ├── Providers (Auth, Theme, Toast)
│   └── children
│       ├── AuthLayout (auth group)
│       │   └── Login/Register Pages
│       └── DashboardLayout (dashboard group)
│           ├── Header
│           ├── BottomNav (mobile)
│           ├── Sidebar (desktop)
│           └── Page Content
```

#### Component Patterns

**1. Page Components** (Server Components por padrão)
```typescript
// app/(dashboard)/clientes/page.tsx
export default async function ClientesPage() {
  // Server-side data fetching
  const clientes = await getClientes();

  return (
    <div>
      <Header title="Clientes" />
      <ClienteList clientes={clientes} />
    </div>
  );
}
```

**2. Client Components** (Interatividade)
```typescript
'use client';

export function ClienteForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateClienteDto) => {
    setLoading(true);
    try {
      await createCliente(data);
      toast.success('Cliente criado!');
    } catch (error) {
      toast.error('Erro ao criar cliente');
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**3. UI Components** (shadcn/ui - Reutilizáveis)
```typescript
// components/ui/button.tsx
export function Button({ variant, size, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      {...props}
    >
      {children}
    </button>
  );
}
```

### State Management

#### Local State (useState, useReducer)
```typescript
// Estado local em componentes
const [isOpen, setIsOpen] = useState(false);
const [selectedDate, setSelectedDate] = useState(new Date());
```

#### Server State (React Query / SWR) - Opcional Fase 2
```typescript
// hooks/useClientes.ts
export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.get('/clientes'),
  });
}
```

#### Context API (Global State)
```typescript
// components/providers/AuthProvider.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### API Client

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro na requisição');
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
```

---

## 🔄 Fluxo de Dados

### Fluxo de Criação de Agendamento (End-to-End)

```
1. USER ACTION
   └─> Usuário preenche formulário de agendamento
       └─> Seleciona cliente, data, horário, serviços

2. CLIENT-SIDE VALIDATION
   └─> React Hook Form valida campos
       ├─> Campos obrigatórios preenchidos?
       ├─> Formato de data válido?
       └─> Pelo menos 1 serviço selecionado?

3. API REQUEST
   └─> Frontend: api.post('/agendamentos', data)
       └─> Headers: Content-Type: application/json
       └─> Body: {
             clienteId: "xyz",
             dataHora: "2026-01-15T14:30:00",
             servicos: [{ servicoId: "abc", preco: 100 }]
           }

4. BACKEND RECEPTION
   └─> Controller recebe POST /agendamentos
       └─> @Body() createAgendamentoDto: CreateAgendamentoDto

5. DTO VALIDATION
   └─> class-validator valida DTO
       ├─> clienteId é string?
       ├─> dataHora é DateTime válido?
       ├─> servicos é array não-vazio?
       └─> Cada serviço tem servicoId e preco?

6. SERVICE BUSINESS LOGIC
   └─> AgendamentosService.create()
       ├─> Verificar se cliente existe
       ├─> Verificar se serviços existem
       ├─> Calcular duração total
       ├─> Verificar conflito de horário
       │   └─> Query: Agendamentos no mesmo período
       └─> Se OK, prosseguir

7. DATABASE TRANSACTION
   └─> Prisma.$transaction([
         // Criar agendamento
         prisma.agendamento.create({
           data: {
             clienteId,
             dataHora,
             valorTotal,
             servicos: {
               create: servicos.map(s => ({
                 servicoId: s.servicoId,
                 preco: s.preco
               }))
             }
           }
         }),
         // Criar notificação (opcional)
         prisma.notificacao.create({...})
       ])

8. RESPONSE
   └─> Controller retorna 201 Created
       └─> Body: {
             id: "new-id",
             clienteId: "xyz",
             dataHora: "2026-01-15T14:30:00",
             status: "PENDENTE",
             valorTotal: 400,
             servicos: [...]
           }

9. CLIENT-SIDE HANDLING
   └─> Frontend recebe resposta
       ├─> Sucesso (201)
       │   ├─> Mostrar toast de sucesso
       │   ├─> Atualizar cache/estado local
       │   └─> Redirecionar para /agenda
       └─> Erro (4xx/5xx)
           ├─> Mostrar toast de erro
           └─> Manter no formulário
```

### Fluxo de Busca de Horários Disponíveis

```
1. USER seleciona data no calendário
   └─> Frontend: onChange(date)

2. DEBOUNCED API CALL
   └─> useDebounce(date, 300ms)
       └─> api.get(`/agendamentos/disponiveis?data=2026-01-15`)

3. BACKEND CALCULATION
   └─> AgendamentosService.getHorariosDisponiveis(data)
       ├─> Buscar agendamentos do dia
       ├─> Gerar slots de 30min (8h-18h)
       ├─> Para cada slot:
       │   ├─> Verificar se já passou (< now)
       │   └─> Verificar se conflita com agendamento
       └─> Retornar lista de horários livres

4. FRONTEND RENDERING
   └─> Componente HorarioSelector renderiza
       └─> horarios.map(h => <option>{h}</option>)
```

---

## 📐 Padrões e Convenções

### Naming Conventions

**Backend (NestJS):**
```
Arquivos:
- Módulos: clientes.module.ts
- Controllers: clientes.controller.ts
- Services: clientes.service.ts
- DTOs: create-cliente.dto.ts, update-cliente.dto.ts
- Entities: cliente.entity.ts

Classes:
- PascalCase: ClientesController, ClientesService
- DTOs: CreateClienteDto, UpdateClienteDto

Métodos:
- camelCase: findAll(), findOne(), create(), update(), remove()

Endpoints:
- kebab-case: /api/clientes, /api/agendamentos/disponiveis
```

**Frontend (Next.js):**
```
Arquivos:
- Pages: page.tsx, layout.tsx
- Components: ClienteCard.tsx, AgendamentoForm.tsx
- Hooks: useClientes.ts, useAuth.ts
- Utils: api.ts, utils.ts

Componentes:
- PascalCase: ClienteCard, AgendamentoForm

Functions:
- camelCase: handleSubmit, fetchClientes

Constants:
- SCREAMING_SNAKE_CASE: API_BASE_URL, MAX_RETRIES
```

### File Organization

**Princípio de Co-location:**
- Agrupar arquivos relacionados juntos
- DTOs com seus módulos
- Components específicos com suas pages

**Barrel Exports:**
```typescript
// types/index.ts
export * from './cliente';
export * from './veiculo';
export * from './servico';

// Uso
import { Cliente, Veiculo, Servico } from '@/types';
```

### Code Style

```typescript
// ✅ BOM
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Cliente[]> {
    return this.prisma.cliente.findMany({
      include: { veiculos: true },
    });
  }
}

// ❌ EVITAR
export class ClientesService {
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  findAll() {
    return this.prisma.cliente.findMany({ include: { veiculos: true } });
  }
}
```

---

## 🔒 Segurança

### Backend Security

**1. Validação de Entrada**
```typescript
// SEMPRE validar com DTOs
@Post()
async create(@Body() dto: CreateClienteDto) {
  // DTO já foi validado automaticamente
  return this.service.create(dto);
}
```

**2. Sanitização**
```typescript
// Prisma previne SQL Injection automaticamente
// Mas sanitizar inputs de texto
import { sanitize } from 'class-sanitizer';

@Transform(({ value }) => sanitize(value))
@IsString()
observacoes: string;
```

**3. Rate Limiting**
```typescript
// main.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
```

**4. CORS**
```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
```

**5. Helmet (Security Headers)**
```typescript
import helmet from 'helmet';
app.use(helmet());
```

### Frontend Security

**1. Sanitização de HTML**
```typescript
// NUNCA usar dangerouslySetInnerHTML sem sanitizar
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

**2. Environment Variables**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3333
# Apenas variáveis com NEXT_PUBLIC_ são expostas ao browser
```

**3. CSP Headers**
```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval';",
          },
        ],
      },
    ];
  },
};
```

---

## ⚡ Performance

### Backend Optimization

**1. Database Indexing**
```prisma
model Cliente {
  telefone String @unique @db.VarChar(15)
  email    String? @unique

  @@index([telefone])
  @@index([email])
}
```

**2. Query Optimization**
```typescript
// ✅ BOM: Usar select específico
await prisma.cliente.findMany({
  select: {
    id: true,
    nome: true,
    telefone: true,
  },
});

// ❌ EVITAR: Buscar tudo
await prisma.cliente.findMany();
```

**3. Pagination**
```typescript
async findAll(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  return this.prisma.cliente.findMany({
    skip,
    take: limit,
  });
}
```

**4. Caching** (Fase 2 - Redis)
```typescript
@Injectable()
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    // Redis get
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // Redis set
  }
}
```

### Frontend Optimization

**1. Code Splitting**
```typescript
// Dynamic imports para componentes pesados
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

**2. Image Optimization**
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // Para imagens above the fold
/>
```

**3. Memoization**
```typescript
// useMemo para cálculos pesados
const valorTotal = useMemo(() => {
  return servicos.reduce((sum, s) => sum + s.preco, 0);
}, [servicos]);

// useCallback para funções passadas como props
const handleSubmit = useCallback((data) => {
  // ...
}, [dependencies]);
```

**4. Debouncing**
```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 🚀 Deployment Architecture

### Fase 1: Desenvolvimento Local

```
Developer Machine
├── Backend: localhost:3333
├── Frontend: localhost:3000
└── Database: SQLite (arquivo local)
```

### Fase 2: Produção (Futura)

```
┌─────────────────────────────────────────┐
│           Vercel (Frontend)             │
│  - Next.js SSR/SSG                      │
│  - Edge Functions                       │
│  - CDN Global                           │
└────────────────┬────────────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────┐
│         Railway/Render (Backend)        │
│  - NestJS API                           │
│  - Docker Container                     │
│  - Auto-scaling                         │
└────────────────┬────────────────────────┘
                 │ Prisma Client
                 ▼
┌─────────────────────────────────────────┐
│        Supabase (Database)              │
│  - PostgreSQL                           │
│  - Auth                                 │
│  - Storage                              │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de Arquitetura

### Backend
- [ ] Estrutura de pastas criada
- [ ] Prisma configurado
- [ ] Módulos NestJS criados
- [ ] DTOs com validação
- [ ] Services com lógica de negócio
- [ ] Controllers com endpoints
- [ ] Error handling global
- [ ] Logging implementado
- [ ] CORS configurado
- [ ] Swagger documentação

### Frontend
- [ ] Estrutura App Router
- [ ] Componentes UI (shadcn/ui)
- [ ] API client configurado
- [ ] Tipos TypeScript definidos
- [ ] Custom hooks criados
- [ ] Layouts responsivos
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Formulários com validação

### Integração
- [ ] Backend e Frontend comunicando
- [ ] Tratamento de erros end-to-end
- [ ] Loading states sincronizados
- [ ] Autenticação (Fase 2)
- [ ] Testes E2E (Opcional)

---

**Versão**: 1.0
**Data**: 2026-01-12
**Documentos Relacionados**: REQUIREMENTS.md, DESIGN-SYSTEM.md, API-SPEC.md, SETUP-GUIDE.md
