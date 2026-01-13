# Sistema de Agendamento - Estética Automotiva

## 📋 Visão Geral

Sistema completo de agendamento para estética automotiva com foco em mobile-first, preparado para integração futura com WhatsApp via IA para agendamentos automatizados e notificações.

---

## 🎯 Objetivos do Projeto

- Criar sistema profissional de agendamento para estética automotiva
- Interface mobile-first com UX simples e intuitiva
- Backend robusto com NestJS e Prisma
- Preparado para escalar do SQLite local para Supabase
- APIs prontas para integração com WhatsApp + IA
- Design moderno e profissional seguindo [Design System documentado](./DESIGN-SYSTEM.md)

---

## 🏗️ Stack Tecnológica

### Backend
- **Framework**: NestJS (Node.js)
- **ORM**: Prisma
- **Banco de Dados**:
  - Fase 1: SQLite (desenvolvimento)
  - Fase 2: PostgreSQL via Supabase
- **Autenticação**: Supabase Auth (email/senha, social login)
- **Validação**: class-validator, class-transformer

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **UI Components**: shadcn/ui (moderno e acessível)
- **Design System**: Especificação completa em [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)
- **Gerenciamento de Estado**: React Context + hooks
- **Requisições**: Fetch API / Axios

### Infraestrutura & DevOps
- **Containerização**: Docker (opcional)
- **Versionamento**: Git
- **Documentação API**: Swagger/OpenAPI (via NestJS)

---

## 📱 Funcionalidades Principais

### 1. Cadastro e Gerenciamento de Clientes

**Campos do Cliente:**
- Nome completo
- Telefone (principal) + WhatsApp
- Email
- CPF/CNPJ (opcional)
- Dados do veículo:
  - Marca
  - Modelo
  - Ano
  - Placa
  - Cor
- Histórico de agendamentos
- Observações/Notas
- Data de cadastro
- Última visita

**Funcionalidades:**
- CRUD completo de clientes
- Busca por nome, telefone, placa
- Visualização de histórico de serviços
- Exportação de dados (CSV)

---

### 2. Catálogo de Serviços

**Campos do Serviço:**
- Nome do serviço
- Descrição detalhada
- Categoria (ex: Lavagem, Polimento, Proteção, etc.)
- Duração estimada (em minutos)
- Preço base
- Disponibilidade (ativo/inativo)
- Imagem ilustrativa (opcional)
- Observações técnicas

**Categorias Sugeridas** (personalizável):
- Lavagem (simples, completa, detalhamento)
- Polimento (técnico, cristalização)
- Proteção (cera, vitrificação, PPF)
- Higienização Interna
- Serviços Especiais

**Funcionalidades:**
- CRUD completo de serviços
- Organização por categorias
- Definição de combos/pacotes
- Preços variáveis por tipo de veículo (pequeno, médio, grande)

---

### 3. Sistema de Agendamento

**Funcionalidades Core:**
- Calendário visual (visão dia, semana, mês)
- Seleção de data e horário disponível
- Escolha de serviço(s)
- Vinculação com cliente (novo ou existente)
- Status do agendamento:
  - Pendente
  - Confirmado
  - Em andamento
  - Concluído
  - Cancelado
- Duração automática baseada nos serviços
- Detecção de conflitos de horário
- Observações do agendamento

**Regras de Negócio:**
- Horário de funcionamento configurável
- Intervalo entre agendamentos configurável
- Máximo de agendamentos simultâneos (se múltiplas baias)
- Bloqueio de horários (feriados, manutenção)
- Agendamentos recorrentes (opcional - fase 2)

**Notificações:**
- Confirmação de agendamento
- Lembrete 24h antes
- Lembrete 2h antes
- Conclusão de serviço
- Solicitação de avaliação

---

### 4. Painel Administrativo

**Dashboard Principal:**
- Agendamentos do dia
- Próximos agendamentos (visão 7 dias)
- Estatísticas:
  - Total de agendamentos (hoje, semana, mês)
  - Receita estimada
  - Taxa de ocupação
  - Clientes novos vs recorrentes
  - Serviços mais populares
- Alertas e notificações
- Atalhos rápidos

**Gerenciamento:**
- Visualização de agenda (calendário)
- Gestão de clientes
- Gestão de serviços
- Configurações do sistema
- Relatórios e analytics

**Configurações:**
- Horário de funcionamento
- Intervalo entre agendamentos
- Dados da empresa
- Integrações (WhatsApp, email)
- Usuários e permissões (fase 2)

---

## 🎨 Design System & UX

> **📘 Documentação Completa:** Consulte o [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) para especificações detalhadas de todos os componentes, paleta de cores completa, tipografia, espaçamento, animações, acessibilidade e padrões de interação.

### Resumo dos Princípios

**Filosofia:**
- **Mobile-First**: Interface otimizada primeiramente para celular
- **Clareza Absoluta**: Cada elemento tem propósito claro
- **Feedback Imediato**: Toda ação gera resposta visual instantânea
- **Hierarquia Visual Clara**: Informações importantes sempre em destaque
- **Consistência Total**: Mesmos padrões em toda aplicação
- **Acessibilidade Universal**: WCAG 2.1 AA compliance

**Stack de UI:**
- **Framework**: Next.js 14+ com App Router
- **Estilização**: Tailwind CSS (utility-first)
- **Componentes**: shadcn/ui (componentes acessíveis e customizáveis)
- **Ícones**: Lucide Icons (leve e consistente)
- **Tipografia**: Inter (otimizada para UI)

### Paleta Principal

```css
Primary (Blue):   #2563EB  /* Botões principais, ações */
Success (Green):  #16A34A  /* Confirmações, concluído */
Warning (Orange): #EA580C  /* Alertas, pendências */
Danger (Red):     #DC2626  /* Erros, cancelamentos */
Neutral (Gray):   #6B7280  /* Textos, backgrounds */
```

### Componentes-Chave

O design system inclui especificações completas para:
- **10 componentes base** (Button, Card, Input, Select, Badge, Dialog, Toast, Calendar, Loading, Empty State)
- **Navegação mobile** (Bottom nav + Top header)
- **Formulários** acessíveis com validação
- **Estados de feedback** (loading, success, error)
- **Animações** otimizadas para performance
- **Layout patterns** (Dashboard, List, Form, Detail)

**📄 Documentos Relacionados:**
- [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) - Especificação completa de design
- [REQUIREMENTS.md](./REQUIREMENTS.md) - Este documento (requisitos funcionais)

---

## 🔌 Integração WhatsApp + IA (Preparação)

### Arquitetura de Integração

**APIs REST Necessárias:**

1. **Webhook Receiver**
   - `POST /api/webhooks/whatsapp`
   - Recebe mensagens do WhatsApp
   - Processa via IA (ChatGPT, Claude, etc.)
   - Retorna resposta estruturada

2. **Agendamento API**
   - `POST /api/agendamentos` - Criar agendamento
   - `GET /api/agendamentos/disponiveis` - Horários disponíveis
   - `PUT /api/agendamentos/:id` - Atualizar agendamento
   - `DELETE /api/agendamentos/:id` - Cancelar agendamento
   - `GET /api/servicos` - Listar serviços
   - `GET /api/clientes/buscar` - Buscar cliente

3. **Notificações API**
   - `POST /api/notificacoes/enviar` - Enviar mensagem WhatsApp
   - `GET /api/notificacoes/templates` - Templates de mensagem
   - `POST /api/notificacoes/agendar` - Agendar envio

### Fluxo de Agendamento via WhatsApp

```
1. Cliente envia mensagem: "Quero agendar uma lavagem completa"
2. WhatsApp Business API → Webhook
3. Backend processa com IA:
   - Identifica cliente (por telefone)
   - Extrai intenção: agendar lavagem completa
   - Consulta horários disponíveis
4. IA responde: "Olá João! Tenho disponível: Amanhã 14h, Sexta 10h..."
5. Cliente escolhe
6. Sistema confirma agendamento
7. Envia confirmação por WhatsApp
```

### Templates de Mensagem

**Confirmação:**
```
✅ Agendamento confirmado!

📅 Data: {data}
🕐 Horário: {horario}
🚗 Serviço: {servico}
💰 Valor: R$ {valor}

📍 Endereço: {endereco}

Qualquer dúvida, é só chamar! 😊
```

**Lembrete:**
```
🔔 Lembrete de agendamento!

Olá {nome}! Seu horário é amanhã às {horario}.

🚗 Serviço: {servico}
⏱ Duração: {duracao}

Confirma presença? Digite SIM ou NÃO
```

---

## 📊 Estrutura do Banco de Dados

### Schema Prisma (Conceitual)

```prisma
model Cliente {
  id              String   @id @default(cuid())
  nome            String
  telefone        String   @unique
  whatsapp        String?
  email           String?  @unique
  cpfCnpj         String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  veiculos        Veiculo[]
  agendamentos    Agendamento[]
  observacoes     String?
}

model Veiculo {
  id              String   @id @default(cuid())
  marca           String
  modelo          String
  ano             Int
  placa           String   @unique
  cor             String?
  clienteId       String
  cliente         Cliente  @relation(fields: [clienteId], references: [id])

  agendamentos    Agendamento[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Servico {
  id              String   @id @default(cuid())
  nome            String
  descricao       String?
  categoria       String
  duracaoMinutos  Int
  preco           Decimal
  ativo           Boolean  @default(true)
  imagemUrl       String?
  observacoes     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  agendamentos    AgendamentoServico[]
}

model Agendamento {
  id              String   @id @default(cuid())
  dataHora        DateTime
  status          StatusAgendamento @default(PENDENTE)
  clienteId       String
  cliente         Cliente  @relation(fields: [clienteId], references: [id])
  veiculoId       String?
  veiculo         Veiculo? @relation(fields: [veiculoId], references: [id])
  observacoes     String?
  valorTotal      Decimal?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  servicos        AgendamentoServico[]
  notificacoes    Notificacao[]
}

model AgendamentoServico {
  id              String   @id @default(cuid())
  agendamentoId   String
  agendamento     Agendamento @relation(fields: [agendamentoId], references: [id])
  servicoId       String
  servico         Servico  @relation(fields: [servicoId], references: [id])
  preco           Decimal

  @@unique([agendamentoId, servicoId])
}

model Notificacao {
  id              String   @id @default(cuid())
  agendamentoId   String
  agendamento     Agendamento @relation(fields: [agendamentoId], references: [id])
  tipo            TipoNotificacao
  status          StatusNotificacao @default(PENDENTE)
  agendadaPara    DateTime?
  enviadaEm       DateTime?
  mensagem        String
  createdAt       DateTime @default(now())
}

model Configuracao {
  id              String   @id @default(cuid())
  chave           String   @unique
  valor           String
  descricao       String?
  updatedAt       DateTime @updatedAt
}

enum StatusAgendamento {
  PENDENTE
  CONFIRMADO
  EM_ANDAMENTO
  CONCLUIDO
  CANCELADO
  NAO_COMPARECEU
}

enum TipoNotificacao {
  CONFIRMACAO
  LEMBRETE_24H
  LEMBRETE_2H
  CONCLUSAO
  AVALIACAO
  CANCELAMENTO
}

enum StatusNotificacao {
  PENDENTE
  ENVIADA
  FALHA
  CANCELADA
}
```

---

## 🚀 Roadmap de Implementação

### Fase 1: MVP Core (SQLite)
1. ✅ Setup do projeto (NestJS + Prisma + SQLite)
2. ✅ Modelagem do banco de dados
3. ✅ Autenticação básica (Supabase Auth)
4. ✅ CRUD de Clientes
5. ✅ CRUD de Veículos
6. ✅ CRUD de Serviços
7. ✅ Sistema de Agendamento (criar, listar, atualizar, cancelar)
8. ✅ Calendário e visualização de agenda
9. ✅ Frontend Next.js com design system
10. ✅ Interface mobile-first responsiva

### Fase 2: Features Avançadas
1. Dashboard administrativo com estatísticas
2. Sistema de notificações (preparação para WhatsApp)
3. Relatórios e analytics
4. Exportação de dados
5. Configurações avançadas

### Fase 3: Migração Supabase
1. Migração do schema para PostgreSQL
2. Setup Supabase backend
3. Configuração Supabase Auth completo
4. Testes de migração
5. Deploy em produção

### Fase 4: Integração WhatsApp + IA
1. Setup WhatsApp Business API
2. Implementação de webhooks
3. Integração com IA (GPT/Claude)
4. Sistema de envio de notificações
5. Agendamento via chat
6. Testes e refinamento

---

## 📁 Estrutura de Pastas

```
agenda-estetica-auto/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── clientes/
│   │   │   │   ├── clientes.controller.ts
│   │   │   │   ├── clientes.service.ts
│   │   │   │   ├── clientes.module.ts
│   │   │   │   └── dto/
│   │   │   ├── veiculos/
│   │   │   ├── servicos/
│   │   │   ├── agendamentos/
│   │   │   ├── notificacoes/
│   │   │   ├── auth/
│   │   │   └── webhooks/
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts
│   │   │   └── schema.prisma
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── filters/
│   │   ├── config/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── prisma/
│   │   └── migrations/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js Frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── agenda/
│   │   │   ├── agendamentos/
│   │   │   ├── clientes/
│   │   │   ├── servicos/
│   │   │   └── configuracoes/
│   │   ├── api/              # Next.js API routes (proxy)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── BottomNav.tsx
│   │   ├── agendamento/
│   │   │   ├── CalendarioAgenda.tsx
│   │   │   ├── FormAgendamento.tsx
│   │   │   └── CardAgendamento.tsx
│   │   ├── clientes/
│   │   └── servicos/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── supabase.ts
│   ├── hooks/
│   ├── types/
│   ├── styles/
│   ├── public/
│   ├── .env.local
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── docs/                       # Documentação
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── WHATSAPP_INTEGRATION.md
│
├── docker-compose.yml          # Docker setup (opcional)
├── .gitignore
└── README.md
```

---

## 🔐 Autenticação & Segurança

### Supabase Auth
- Setup de Supabase Project
- Configuração de provedores (email, Google, etc.)
- JWT tokens para autenticação
- Row Level Security (RLS) no banco
- Refresh tokens

### Segurança Backend
- Helmet.js para headers HTTP
- CORS configurado
- Rate limiting
- Validação de dados (class-validator)
- Sanitização de inputs
- Hash de senhas (bcrypt)
- Proteção contra SQL injection (Prisma)

---

## 📝 Notas de Implementação

### Prioridades
1. **Mobile-First**: Testar em dispositivos móveis reais durante desenvolvimento
2. **Performance**: Lazy loading, code splitting, cache inteligente
3. **UX**: Feedback visual em todas as ações, loading states
4. **Validações**: Frontend + Backend
5. **Testes**: Cobertura mínima de 70% nas regras de negócio

### Tecnologias Opcionais (Avaliar necessidade)
- Redis para cache
- Bull/BullMQ para filas de jobs
- Winston para logs estruturados
- Sentry para error tracking
- Algolia para busca avançada

### Considerações de Escalabilidade
- Separação backend/frontend permite escalar independentemente
- Prisma facilita migração entre databases
- APIs RESTful stateless
- Preparado para microserviços futuros (ex: serviço de notificações separado)

---

## ✅ Definição de Pronto (DoD)

Um feature está pronto quando:
- [ ] Código implementado e revisado
- [ ] Testes unitários escritos e passando
- [ ] Testado manualmente em mobile (Chrome DevTools)
- [ ] Documentação atualizada
- [ ] Sem erros no console
- [ ] Performance aceitável (< 3s carregamento)
- [ ] Responsivo em mobile, tablet e desktop
- [ ] Acessível (contraste, navegação por teclado)

---

## 📚 Documentação do Projeto

Este projeto possui documentação estruturada em múltiplos arquivos:

### Documentos Principais

1. **[REQUIREMENTS.md](./REQUIREMENTS.md)** (este arquivo)
   - Requisitos funcionais completos
   - Stack tecnológica
   - Funcionalidades detalhadas
   - Integrações planejadas
   - Roadmap de implementação

2. **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)**
   - Especificação completa de UI/UX
   - Paleta de cores detalhada (50+ tons)
   - Sistema tipográfico completo
   - Espaçamento e grid system (8pt base)
   - 10+ componentes especificados
   - Padrões de interação e animações
   - Guidelines de acessibilidade (WCAG 2.1 AA)
   - Layout patterns e exemplos
   - Configuração Tailwind + shadcn/ui

### Documentos Futuros (a criar durante desenvolvimento)

3. **API.md** - Documentação completa da API REST
4. **DEPLOYMENT.md** - Guia de deploy e infraestrutura
5. **WHATSAPP_INTEGRATION.md** - Integração WhatsApp + IA
6. **README.md** - Guia de setup e uso da aplicação

---

## 📞 Contato & Suporte

### Referências Técnicas

Para dúvidas durante o desenvolvimento, consultar:

**Stack Principal:**
1. **NestJS**: https://docs.nestjs.com
2. **Prisma**: https://www.prisma.io/docs
3. **Next.js**: https://nextjs.org/docs
4. **Supabase**: https://supabase.com/docs

**UI/UX:**
5. **shadcn/ui**: https://ui.shadcn.com
6. **Tailwind CSS**: https://tailwindcss.com/docs
7. **Lucide Icons**: https://lucide.dev

**Design & Acessibilidade:**
8. **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
9. **Material Design**: https://m3.material.io (referência)

---

---

## 🤖 Execução com Ralph Loop

### Como Executar a Implementação Completa

Para implementar todo o sistema de forma autônoma usando o Ralph Loop, execute o comando abaixo na raiz do projeto:

```bash
/ralph-loop "Implementar o sistema completo de agendamento de estética automotiva seguindo REQUIREMENTS.md, ARCHITECTURE.md, API-SPEC.md, DESIGN-SYSTEM.md e SETUP-GUIDE.md. Criar backend NestJS com Prisma + SQLite, frontend Next.js mobile-first com shadcn/ui, e todas as funcionalidades da Fase 1. Outputar <promise>APLICAÇÃO COMPLETA E FUNCIONAL</promise> quando tudo estiver implementado e testado com npm run dev funcionando em ambos backend e frontend." --completion-promise "APLICAÇÃO COMPLETA E FUNCIONAL" --max-iterations 50
```

### O que o Ralph Loop vai fazer:

1. **Backend (NestJS)**:
   - Criar estrutura de pastas completa
   - Configurar Prisma com schema.prisma
   - Implementar todos os módulos (Clientes, Veículos, Serviços, Agendamentos)
   - Criar DTOs com validações
   - Implementar Services com lógica de negócio
   - Criar Controllers com todos endpoints da API
   - Configurar CORS, validação global, error handling
   - Seed data para testes

2. **Frontend (Next.js)**:
   - Criar estrutura App Router
   - Instalar e configurar shadcn/ui
   - Implementar componentes seguindo DESIGN-SYSTEM.md
   - Criar todas as páginas (Dashboard, Clientes, Veículos, Serviços, Agendamentos)
   - Implementar formulários com validação
   - Integrar com API backend
   - Layout mobile-first responsivo

3. **Testes**:
   - Testar backend: `cd backend && npm run dev`
   - Testar frontend: `cd frontend && npm run dev`
   - Verificar integração completa

### Promise de Conclusão

O Ralph só vai outputar `<promise>APLICAÇÃO COMPLETA E FUNCIONAL</promise>` quando:

- ✅ Backend rodando sem erros em `http://localhost:3333`
- ✅ Frontend rodando sem erros em `http://localhost:3000`
- ✅ Banco de dados SQLite criado e funcional
- ✅ Todos os endpoints da API funcionando
- ✅ Interface web acessível e funcional
- ✅ CRUD de Clientes, Veículos, Serviços e Agendamentos implementados
- ✅ Design System aplicado corretamente
- ✅ Sem erros no console

### Documentação de Referência

O Ralph tem acesso completo a:
- **REQUIREMENTS.md**: Este arquivo (requisitos funcionais)
- **ARCHITECTURE.md**: Estrutura técnica detalhada
- **API-SPEC.md**: Especificação completa da API REST
- **DESIGN-SYSTEM.md**: Sistema de design UI/UX
- **SETUP-GUIDE.md**: Guia de configuração e troubleshooting

---

**Versão do Documento**: 1.2
**Última Atualização**: 2026-01-12
**Status**: Pronto para Ralph Loop
**Documentos Relacionados**: DESIGN-SYSTEM.md, ARCHITECTURE.md, API-SPEC.md, SETUP-GUIDE.md
