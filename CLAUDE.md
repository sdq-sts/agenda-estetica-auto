# Claude Context - Agenda Estética Auto

> **Arquivo principal para Claude.** Leia isto primeiro antes de trabalhar no projeto.

---

## 📋 Visão Geral

SaaS para agendamento de estética automotiva (lava-jato). Stack:
- **Frontend:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Backend:** NestJS + Prisma + PostgreSQL
- **Design:** Refined Functional (8.5/10) - inspirado em Calendly, Linear, Notion

**Público-alvo:** Donos de lava-jato / estética automotiva
**Objetivo:** Design limpo, funcional, profissional (NÃO luxury/premium)

---

## 🎨 Design System

**CRITICAL:** Sempre seguir `DESIGN-SYSTEM.md`

### Quick Reference:

```tsx
// Typography
font-outfit              // Headings (h1-h6)
font-sans                // Body text
tracking-tight           // Headings
uppercase tracking-wider // Section titles

// Colors
blue-600, teal-600       // Primary/Accent
gray-50 to gray-900      // Neutrals

// Components
<ModernCard>             // rounded-xl shadow-soft hover:shadow-medium
<Button>                 // Blue gradient, active:scale-[0.98]
<StatusBadge>            // Colored pills

// Shadows
shadow-soft              // Default
shadow-medium            // Hover
shadow-lift              // Elevated

// Spacing
8pt grid (gap-2/4/6/8)
container max-w-6xl px-6
```

**Leia o arquivo completo:** `DESIGN-SYSTEM.md`

---

## 📂 Estrutura do Projeto

```
/frontend
  /app
    /page.tsx              # Home (dashboard)
    /clientes/page.tsx     # Clientes CRUD
    /veiculos/page.tsx     # Veículos CRUD
    /servicos/page.tsx     # Serviços CRUD
    /agendamentos/page.tsx # Agendamentos CRUD
  /components
    /ui/                   # shadcn components
      modern-card.tsx      # Card system (refined)
      button.tsx           # Button variants
      status-badge.tsx     # Status indicators
    bottom-nav.tsx         # Mobile navigation
  /lib
    api.ts                 # API client
  tailwind.config.ts       # Theme config
  app/globals.css          # Global styles + utilities

/backend
  /src
    /clientes              # Clientes module
    /veiculos              # Veículos module
    /servicos              # Serviços module
    /agendamentos          # Agendamentos module
  prisma/schema.prisma     # Database schema
```

---

## 🔧 Arquivos Importantes

### Para Design/Frontend:
- **`DESIGN-SYSTEM.md`** ⭐ - Design system completo (SEMPRE seguir)
- `ARCHITECTURE.md` - Arquitetura geral
- `frontend/tailwind.config.ts` - Tema Tailwind
- `frontend/app/globals.css` - Utilidades CSS custom

### Para Backend/API:
- **`API-SPEC.md`** - Especificação da API
- `backend/prisma/schema.prisma` - Schema do banco
- `ARCHITECTURE.md` - Estrutura dos módulos

### Setup:
- `SETUP-GUIDE.md` - Como rodar o projeto
- `REQUIREMENTS.md` - Requisitos e funcionalidades

---

## ✅ Checklist para Novas Features

Quando adicionar nova funcionalidade:

### Design:
- [ ] Headers usam `font-outfit` com `tracking-tight`
- [ ] Section titles são `uppercase` com `tracking-wider`
- [ ] Cards têm `shadow-soft` e hover states
- [ ] Botões seguem os variants (default/outline/destructive)
- [ ] Ícones usam gradientes blue/teal
- [ ] Spacing segue 8pt grid
- [ ] Hover states incluem transforms sutis
- [ ] Animações com staggered delays
- [ ] Header sticky com `backdrop-blur-sm`
- [ ] Layout usa `container max-w-6xl`

### Code:
- [ ] TypeScript sem `any` (usar tipos corretos)
- [ ] API calls via `lib/api.ts`
- [ ] Loading states implementados
- [ ] Error handling adequado
- [ ] Mobile responsive
- [ ] Acessibilidade (min-h-[44px] em botões)

---

## 🎯 Padrões de Código

### Frontend (Next.js):

```tsx
// Sempre use 'use client' se precisa de hooks
'use client';

import { useState, useEffect } from 'react';
import { ModernCard, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { clientesAPI } from '@/lib/api';

export default function MinhaPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await clientesAPI.getAll();
        setData(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-20 lg:pb-4">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
        {/* Header content */}
      </header>

      <main className="container mx-auto px-6 max-w-6xl mt-8 space-y-8">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Section Title
          </h2>
          {/* Content */}
        </div>
      </main>
    </div>
  );
}
```

### Backend (NestJS):

```typescript
// Controller
@Controller('resource')
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.service.findAll(paginationDto);
  }
}

// Service
@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({ skip, take: limit }),
      this.prisma.resource.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
```

---

## 🚫 O que NÃO fazer

### Design:
- ❌ Não usar o design "Premium" antigo (black/gold/amber)
- ❌ Não usar fonts genéricas (Arial, Inter, Roboto) nos headings
- ❌ Não criar cards sem hover states
- ❌ Não usar spacing arbitrário (seguir 8pt grid)
- ❌ Não fazer designs "luxury" ou muito decorados

### Code:
- ❌ Não usar `any` no TypeScript
- ❌ Não fazer fetch direto (usar `lib/api.ts`)
- ❌ Não esquecer loading states
- ❌ Não criar arquivos sem ler antes
- ❌ Não usar `sed` para edição de código React/JSX (usar Edit tool)

---

## 💡 Dicas Importantes

1. **Design:** O usuário quer "bonito e funcional", não luxury. Inspiração: Calendly, Linear, Notion.

2. **Mobile-first:** Sempre garantir min-h-[44px] em elementos interativos.

3. **Performance:**
   - Usar loading states
   - Animações sutis (300ms)
   - Staggered delays para listas

4. **Consistência:**
   - Todos os headers devem ser iguais
   - Todos os cards devem ter hover states
   - Todos os botões seguem os variants

5. **Nomenclatura:**
   - Use `ModernCard` (não `Card` ou `PremiumCard`)
   - Use classes do design system documentado

---

## 🔄 Histórico de Design

### v1.0 - Bootstrap 2011 (Rating: 4/10)
- Design básico, sem personalidade
- ❌ Rejeitado

### v2.0 - Premium Black & Gold (Rating: 3/10)
- Corner accents, slate+amber, glassmorphism
- ❌ Usuário odiou: "tá uma merda"

### v3.0 - Refined Functional (Rating: 8.5/10) ✅
- **ATUAL:** Clean, inspirado em Calendly/Linear
- Outfit font, blue/teal, sophisticated shadows
- Hover states, micro-animations
- ✅ Aprovado pelo usuário: "Tá bonito pra porra"

---

## 📞 Comandos Úteis

```bash
# Frontend
cd frontend
npm run dev          # http://localhost:3000

# Backend
cd backend
npm run start:dev    # http://localhost:3333

# Database
cd backend
npx prisma studio    # GUI do banco
npx prisma migrate dev

# Screenshots
cd frontend
node screenshot-all.js
```

---

## 📝 Notas Finais

- **Sempre ler DESIGN-SYSTEM.md antes de criar features novas**
- Backend rodando em `localhost:3333`
- Frontend rodando em `localhost:3000`
- Database: PostgreSQL via Prisma
- Design rating atual: **8.5-9/10**

**Última atualização:** 2026-01-13
