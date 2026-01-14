# Agenda Estética Auto

Sistema de agendamento para estética automotiva com multi-tenancy, autenticação JWT e controle de pagamentos.

## Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Backend:** NestJS + Prisma + SQLite
- **Design:** Refined Functional (8.5/10) - inspirado em Calendly, Linear, Notion

## Quick Start

```bash
# Backend
cd backend
npm install
npx prisma db push
npm run seed
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

**Login de teste:** admin@demo.com / admin123

## Documentação

- **[CLAUDE.md](./CLAUDE.md)** - Context principal para desenvolvimento
- **[PRODUTO.md](./PRODUTO.md)** - Roadmap e funcionalidades
- **[docs/DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md)** - Design system completo
- **[docs/SETUP-GUIDE.md](./docs/SETUP-GUIDE.md)** - Guia detalhado de setup
- **[docs/api/API-SPEC.md](./docs/api/API-SPEC.md)** - Especificação da API
- **[docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md)** - Arquitetura do sistema

## Features Implementadas

### Sprint 1 - Crítico ✅
- ✅ Calendário semanal
- ✅ Bloqueio de horários
- ✅ Controle de pagamento

### Core ✅
- ✅ Multi-tenancy com isolamento por tenant
- ✅ Autenticação JWT
- ✅ CRUD de Clientes
- ✅ CRUD de Veículos
- ✅ CRUD de Serviços
- ✅ CRUD de Agendamentos
- ✅ Sistema de pagamento (PENDENTE/PAGO/REEMBOLSADO)
- ✅ Design Refined Functional (8.5/10)

### Próximos Passos (Sprint 2)
- [ ] Integração WhatsApp
- [ ] Política de cancelamento
- [ ] Histórico do cliente

## Estrutura

```
/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Autenticação JWT
│   │   ├── clientes/       # Módulo de clientes
│   │   ├── veiculos/       # Módulo de veículos
│   │   ├── servicos/       # Módulo de serviços
│   │   ├── agendamentos/   # Módulo de agendamentos
│   │   └── bloqueios/      # Bloqueio de horários
│   └── prisma/
│       └── schema.prisma   # Database schema
│
├── frontend/               # Next.js App
│   ├── app/               # Pages (App Router)
│   ├── components/        # React components
│   └── lib/              # Utilities & API client
│
└── docs/                  # Documentation
    ├── api/              # API specs
    ├── architecture/     # Architecture docs
    └── archive/          # Archived docs

```

## License

Private - All rights reserved
