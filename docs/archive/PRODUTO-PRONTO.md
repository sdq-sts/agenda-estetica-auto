# Agenda Estética Auto - Roadmap para Produto Vendável

> **Análise Completa:** 2026-01-14
> **Status Atual:** MVP (8.5/10 design) - Single-user
> **Objetivo:** SaaS Multi-tenant com Agente de IA para WhatsApp

---

## 📊 SITUAÇÃO ATUAL

### ✅ O QUE JÁ TEMOS (Funcional e Bonito)

**Backend (NestJS + Prisma + SQLite):**
- ✅ CRUD completo: Clientes, Veículos, Serviços, Agendamentos
- ✅ Sistema de bloqueios de horário (recorrente e pontual)
- ✅ Detecção de conflitos de agendamento automática
- ✅ Cálculo de slots disponíveis em tempo real
- ✅ Configuração de horários de funcionamento por dia da semana
- ✅ Validações de negócio (veículo pertence ao cliente, serviços ativos, etc)
- ✅ API REST bem estruturada com paginação e filtros

**Frontend (Next.js 15 + Tailwind + shadcn/ui):**
- ✅ Dashboard com estatísticas e acesso rápido
- ✅ Calendário semanal visual (react-big-calendar)
- ✅ CRUD de todas as entidades com modais mobile-first
- ✅ Design system refinado (Outfit font, blue/teal, shadows sutis)
- ✅ Responsivo mobile/tablet/desktop (nota 8.5/10)
- ✅ Filtros por status, busca por cliente/veículo
- ✅ Toast notifications para feedback visual
- ✅ Loading states e error handling

**Pontos Fortes:**
- Design profissional e moderno
- Código bem estruturado e tipado (TypeScript 100%)
- Arquitetura modular e escalável
- UX intuitiva para usuários não-técnicos

### ❌ O QUE FALTA (Critical para Vender)

**Bloqueadores Críticos:**
1. ❌ **Autenticação** - Qualquer um acessa tudo
2. ❌ **Multi-tenancy** - Um lava-jato vê dados de outro
3. ❌ **Sistema de Pagamento** - Como cobrar assinatura?
4. ❌ **Portal do Cliente** - Cliente não consegue agendar sozinho
5. ❌ **Notificações WhatsApp/SMS** - Cliente não recebe lembretes
6. ❌ **Agente de IA** - O diferencial competitivo principal

**Impedimentos Técnicos:**
- SQLite (dev-only, não aguenta múltiplos tenants)
- Sem autenticação/autorização
- Sem webhook de pagamento
- Sem infraestrutura de produção

---

## 🎯 ROADMAP COMPLETO (60 dias)

### **FASE 1: FUNDAÇÕES SaaS** (30 dias)

#### 1.1 Autenticação & Multi-tenancy (10 dias)
**Objetivo:** Cada lava-jato tem conta separada e dados isolados.

**Tarefas:**
- [ ] Adicionar models `Tenant` e `User` no Prisma schema
- [ ] Implementar JWT authentication (Passport.js)
- [ ] Criar módulo `auth` com login/logout/register
- [ ] Adicionar `tenantId` em TODOS os models existentes
- [ ] Criar middleware `TenantGuard` para isolar dados por tenant
- [ ] Atualizar todos os services para filtrar por `tenantId`
- [ ] Criar página de login/registro no frontend
- [ ] Implementar guards no frontend (redirect se não autenticado)
- [ ] Adicionar header com nome do usuário/tenant
- [ ] Migração de dados: criar tenant default para dados existentes

**Schema Prisma (adicionar):**
```prisma
model Tenant {
  id          String   @id @default(cuid())
  nome        String
  slug        String   @unique // lavajaopremium
  whatsapp    String?  // Número WhatsApp do negócio
  email       String   @unique
  plano       String   @default("FREE") // FREE, BASIC, PRO, ENTERPRISE
  ativo       Boolean  @default(true)
  stripeCustomerId String? @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  usuarios      User[]
  clientes      Cliente[]
  veiculos      Veiculo[]
  servicos      Servico[]
  agendamentos  Agendamento[]
  bloqueios     BloqueioHorario[]
  configuracoes Configuracao[]
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  senha     String   // bcrypt hash
  nome      String
  role      String   @default("ATENDENTE") // OWNER, ADMIN, ATENDENTE
  ativo     Boolean  @default(true)
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
}
```

**Arquivos a criar:**
```
backend/src/auth/
  ├── auth.module.ts
  ├── auth.controller.ts
  ├── auth.service.ts
  ├── dto/login.dto.ts
  ├── dto/register.dto.ts
  ├── jwt.strategy.ts
  ├── tenant.guard.ts
  └── roles.guard.ts

backend/src/tenants/
  ├── tenants.module.ts
  ├── tenants.controller.ts
  └── tenants.service.ts

frontend/app/(auth)/
  ├── login/page.tsx
  ├── register/page.tsx
  └── layout.tsx
```

**Exemplo de TenantGuard:**
```typescript
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // vem do JWT

    // Injeta tenantId em todas as queries
    request.tenantId = user.tenantId;
    return true;
  }
}
```

---

#### 1.2 Sistema de Pagamento (7 dias)
**Objetivo:** Cobrar assinatura mensal via Stripe.

**Tarefas:**
- [ ] Criar conta Stripe (modo test)
- [ ] Instalar `@stripe/stripe-js` no frontend
- [ ] Criar produtos no Stripe Dashboard (BASIC, PRO)
- [ ] Implementar módulo `pagamentos` no backend
- [ ] Criar endpoint `POST /pagamentos/checkout` (gera session Stripe)
- [ ] Criar endpoint `POST /pagamentos/webhook` (processa eventos)
- [ ] Criar página `/pricing` no frontend (cards de planos)
- [ ] Implementar botão "Assinar" que redireciona para Stripe Checkout
- [ ] Após pagamento bem-sucedido, atualizar `tenant.plano` e `tenant.stripeCustomerId`
- [ ] Criar guard `PlanGuard` para bloquear features por plano
- [ ] Implementar lógica de limites (ex: FREE = 50 agendamentos/mês)
- [ ] Criar página "Meu Plano" mostrando status da assinatura

**Planos Sugeridos:**
```
🆓 FREE (14 dias trial)
- Até 50 agendamentos/mês
- 1 usuário
- Portal do cliente básico

💼 BASIC - R$ 49/mês
- Agendamentos ilimitados
- 3 usuários
- Portal do cliente
- Bot WhatsApp (100 conversas/mês)
- Notificações automáticas

🚀 PRO - R$ 149/mês
- Tudo do Basic
- Usuários ilimitados
- Bot WhatsApp ilimitado
- Relatórios avançados
- Suporte prioritário

🏢 ENTERPRISE - R$ 499/mês
- White-label
- API customizada
- Múltiplas unidades
- Integração customizada
```

**Webhook Handler:**
```typescript
@Post('webhook')
async handleStripeWebhook(@Req() req) {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed':
      // Ativar assinatura do tenant
      await this.tenantsService.update(tenantId, {
        plano: 'BASIC',
        ativo: true,
        stripeCustomerId: event.data.object.customer,
      });
      break;

    case 'invoice.payment_failed':
      // Desativar tenant após 3 falhas
      await this.tenantsService.update(tenantId, { ativo: false });
      break;

    case 'customer.subscription.deleted':
      // Downgrade para FREE
      await this.tenantsService.update(tenantId, { plano: 'FREE' });
      break;
  }
}
```

**Arquivos a criar:**
```
backend/src/pagamentos/
  ├── pagamentos.module.ts
  ├── pagamentos.controller.ts
  ├── pagamentos.service.ts
  └── plan.guard.ts

frontend/app/pricing/
  └── page.tsx

frontend/app/meu-plano/
  └── page.tsx
```

---

#### 1.3 Portal do Cliente (10 dias)
**Objetivo:** Cliente agenda sozinho sem precisar ligar/WhatsApp.

**URL:** `https://seuapp.com/book/[slug]`
**Exemplo:** `https://seuapp.com/book/lavajaopremium`

**Fluxo:**
1. Cliente acessa link compartilhado pelo lava-jato
2. Vê serviços disponíveis com preços e duração
3. Seleciona um ou mais serviços
4. Escolhe data no calendário (mostra apenas dias disponíveis)
5. Escolhe horário (mostra apenas slots livres)
6. Preenche formulário: nome, telefone, WhatsApp, placa do veículo
7. Confirma agendamento
8. Recebe confirmação via WhatsApp/SMS automático

**Tarefas:**
- [ ] Criar rota pública `GET /tenants/slug/:slug` (retorna dados do tenant)
- [ ] Criar rota pública `GET /public/servicos/:tenantId`
- [ ] Criar rota pública `GET /public/disponiveis/:tenantId?data=`
- [ ] Criar rota pública `POST /public/agendamentos` (sem auth)
- [ ] Validar campos obrigatórios (telefone, nome, placa)
- [ ] Criar ou vincular cliente automaticamente
- [ ] Criar ou vincular veículo automaticamente
- [ ] Página `/book/[slug]/page.tsx` no frontend
- [ ] Componente `ServiceSelector` (cards de serviços)
- [ ] Componente `DatePicker` (react-day-picker)
- [ ] Componente `TimeSlotPicker` (grade de horários)
- [ ] Componente `CustomerForm` (nome, telefone, placa)
- [ ] Página de confirmação (`/book/[slug]/success`)
- [ ] Enviar notificação WhatsApp ao cliente (via Evolution API)
- [ ] Enviar notificação ao lava-jato (novo agendamento)

**Design do Portal:**
- Clean, sem menu/header do dashboard
- Branding do tenant (logo, cores)
- Mobile-first (maioria dos clientes usa celular)
- Carregamento rápido
- Zero fricção

**Exemplo de rota pública:**
```typescript
@Controller('public')
export class PublicController {
  @Get('servicos/:tenantId')
  async getServicos(@Param('tenantId') tenantId: string) {
    return this.servicosService.findAll({
      where: { tenantId, ativo: true },
    });
  }

  @Post('agendamentos')
  async createAgendamento(@Body() dto: CreatePublicAgendamentoDto) {
    // 1. Criar/buscar cliente por telefone
    let cliente = await this.clientesService.findByTelefone(
      dto.tenantId,
      dto.telefone,
    );

    if (!cliente) {
      cliente = await this.clientesService.create({
        tenantId: dto.tenantId,
        nome: dto.nome,
        telefone: dto.telefone,
        whatsapp: dto.whatsapp,
      });
    }

    // 2. Criar/buscar veículo
    let veiculo = await this.veiculosService.findByPlaca(
      dto.tenantId,
      dto.placa,
    );

    if (!veiculo) {
      veiculo = await this.veiculosService.create({
        tenantId: dto.tenantId,
        clienteId: cliente.id,
        placa: dto.placa,
        marca: dto.marca || 'Não informado',
        modelo: dto.modelo || 'Não informado',
        ano: dto.ano || new Date().getFullYear(),
      });
    }

    // 3. Criar agendamento
    const agendamento = await this.agendamentosService.create({
      tenantId: dto.tenantId,
      clienteId: cliente.id,
      veiculoId: veiculo.id,
      dataHora: dto.dataHora,
      servicoIds: dto.servicoIds,
      status: 'PENDENTE',
    });

    // 4. Enviar notificação
    await this.notificacoesService.enviarConfirmacao(agendamento);

    return agendamento;
  }
}
```

**Arquivos a criar:**
```
backend/src/public/
  ├── public.module.ts
  ├── public.controller.ts
  └── dto/create-public-agendamento.dto.ts

frontend/app/book/[slug]/
  ├── page.tsx
  ├── layout.tsx (sem BottomNav)
  ├── success/page.tsx
  └── components/
      ├── service-selector.tsx
      ├── date-picker.tsx
      ├── time-slot-picker.tsx
      └── customer-form.tsx
```

---

#### 1.4 Migração PostgreSQL (3 dias)
**Objetivo:** SQLite não aguenta produção multi-tenant.

**Tarefas:**
- [ ] Provisionar PostgreSQL no Fly.io (`flyctl postgres create`)
- [ ] Atualizar `schema.prisma`: `provider = "postgresql"`
- [ ] Criar `.env.production` com `DATABASE_URL` do Fly.io
- [ ] Rodar `npx prisma migrate dev` para gerar migrations
- [ ] Rodar `npx prisma db push` no banco de produção
- [ ] Testar conexão local → Fly Postgres
- [ ] Criar seed script para dados de exemplo
- [ ] Documentar backup strategy

**DATABASE_URL (Fly.io):**
```
postgres://postgres:password@your-db.fly.dev:5432/dbname?sslmode=disable
```

---

### **FASE 2: DIFERENCIAL DE IA** (20 dias)

#### 2.1 WhatsApp Bot com IA (Claude API) (15 dias)
**Objetivo:** Cliente agenda via WhatsApp conversando com IA.

**Arquitetura:**
```
WhatsApp (Cliente)
    ↓
Evolution API (recebe/envia mensagens)
    ↓
backend/src/whatsapp-bot/ (processa com Claude)
    ↓
Claude API (entende contexto, decide ações)
    ↓
backend/src/agendamentos/ (cria agendamento)
    ↓
WhatsApp (envia confirmação)
```

**Tarefas:**

**2.1.1 Setup Evolution API (3 dias):**
- [ ] Deploy Evolution API no Fly.io (Docker)
- [ ] Conectar via QR Code no WhatsApp Business
- [ ] Configurar webhook: `POST https://api.seuapp.com/whatsapp/webhook`
- [ ] Testar envio/recebimento de mensagens
- [ ] Criar service `WhatsAppService` para enviar mensagens
- [ ] Implementar retry logic (mensagens podem falhar)

**2.1.2 Módulo WhatsApp Bot (7 dias):**
- [ ] Criar módulo `whatsapp-bot` no backend
- [ ] Instalar `@anthropic-ai/sdk`
- [ ] Criar `BotService` com método `processarMensagem()`
- [ ] Implementar histórico de conversação (salvar em Redis/DB)
- [ ] Criar system prompt detalhado para Claude
- [ ] Implementar tools (function calling):
  - `criar_agendamento`
  - `consultar_disponibilidade`
  - `buscar_agendamentos_cliente`
  - `cancelar_agendamento`
  - `listar_servicos`
- [ ] Implementar lógica de tool execution
- [ ] Criar controller `WhatsAppController` para webhook
- [ ] Identificar tenant pelo número WhatsApp
- [ ] Rate limiting por cliente (evitar spam)
- [ ] Logs estruturados (todas conversas salvas)

**2.1.3 Inteligência do Bot (5 dias):**
- [ ] Prompt engineering: tom amigável, eficiente
- [ ] Contexto do cliente (histórico, agendamentos anteriores)
- [ ] Detecção de intenção (agendar, cancelar, informações)
- [ ] Coleta de dados faltantes (placa, serviço, horário)
- [ ] Confirmação antes de criar agendamento
- [ ] Tratamento de erros (horário indisponível, dados inválidos)
- [ ] Sugestões inteligentes (horários alternativos)
- [ ] Multi-turno (conversa longa até finalizar)

**System Prompt (exemplo):**
```markdown
Você é o assistente virtual de {tenant.nome}, um lava-jato/estética automotiva.

CONTEXTO DO CLIENTE:
{cliente ? `Cliente conhecido: ${cliente.nome}, telefone: ${cliente.telefone}` : 'Cliente novo (precisa coletar dados)'}

AGENDAMENTOS ANTERIORES:
{agendamentosPassados.map(a => `- ${a.dataHora}: ${a.servicos}`).join('\n')}

SERVIÇOS DISPONÍVEIS:
{servicos.map(s => `- ${s.nome}: R$ ${s.preco} (${s.duracaoMinutos}min) - ${s.descricao}`).join('\n')}

HORÁRIOS DE FUNCIONAMENTO:
{configuracoes.horarios}

HORÁRIOS DISPONÍVEIS HOJE:
{disponiveis.map(d => moment(d).format('HH:mm')).join(', ')}

SUA MISSÃO:
1. Entender o que o cliente quer (agendar, cancelar, informações, reclamação)
2. Ser cordial, amigável e eficiente
3. Se for AGENDAR:
   - Perguntar qual serviço deseja
   - Perguntar qual data/horário prefere
   - Listar horários disponíveis (use a tool consultar_disponibilidade)
   - Perguntar placa do veículo (se novo cliente)
   - CONFIRMAR todos os dados antes de finalizar
   - Usar a tool criar_agendamento para finalizar
4. Se for CANCELAR:
   - Confirmar qual agendamento
   - Pedir confirmação
   - Usar a tool cancelar_agendamento
5. Se for INFORMAÇÕES:
   - Responder sobre preços, serviços, horários
6. NUNCA invente horários - sempre consulte via tool
7. Se horário indisponível, sugira alternativas próximas

REGRAS:
- Responda em português brasileiro
- Seja natural e conversacional (não robótico)
- Use emojis com moderação (🚗 💰 📅 ✅)
- Se não entender, peça esclarecimento
- Máximo 2 mensagens por vez (não envie textão)

TOOLS DISPONÍVEIS:
- criar_agendamento: cria novo agendamento no sistema
- consultar_disponibilidade: retorna horários livres em uma data
- buscar_agendamentos_cliente: lista agendamentos do cliente
- cancelar_agendamento: cancela um agendamento existente
- listar_servicos: retorna catálogo de serviços com preços
```

**Exemplo de Conversa:**
```
Cliente: Oi, quero agendar uma lavagem

Bot: Olá! 👋 Temos os seguintes serviços de lavagem:

1. Lavagem Simples - R$ 50 (30min)
2. Lavagem Completa - R$ 80 (1h)
3. Lavagem Premium + Cera - R$ 150 (2h)

Qual você prefere?

Cliente: A completa

Bot: Ótimo! 🚗 A Lavagem Completa sai por R$ 80 e leva 1 hora.

Qual dia você prefere? Temos horários disponíveis amanhã (15/01), quinta (16/01) e sexta (17/01).

Cliente: Amanha as 14h

Bot: [chama tool consultar_disponibilidade(data='2026-01-15')]

Perfeito! Amanhã 15/01 às 14h está disponível. ✅

Qual a placa do seu veículo?

Cliente: ABC1234

Bot: [chama tool criar_agendamento(
  servicoIds=['lavagem_completa'],
  dataHora='2026-01-15T14:00:00',
  placa='ABC1234'
)]

🎉 Agendamento confirmado!

📅 Dia 15/01/2026 às 14h
🚗 Veículo: ABC1234
🔧 Serviço: Lavagem Completa
💰 Valor: R$ 80,00

Vou te enviar um lembrete 1 dia antes. Até lá! 😊
```

**Implementação:**
```typescript
// backend/src/whatsapp-bot/bot.service.ts
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class WhatsAppBotService {
  private claude = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  async processarMensagem(
    tenantId: string,
    telefoneCliente: string,
    mensagem: string,
  ) {
    // 1. Buscar tenant
    const tenant = await this.tenantsService.findOne(tenantId);

    // 2. Buscar/criar cliente
    let cliente = await this.clientesService.findByTelefone(
      tenantId,
      telefoneCliente,
    );

    // 3. Buscar contexto
    const servicos = await this.servicosService.findAll(tenantId);
    const agendamentosPassados = cliente
      ? await this.agendamentosService.findByCliente(cliente.id)
      : [];
    const hoje = new Date();
    const disponiveis = await this.agendamentosService.findAvailableSlots(
      tenantId,
      hoje,
    );
    const configuracoes = await this.configuracoesService.findAll(tenantId);

    // 4. Buscar histórico da conversa
    const historicoMensagens = await this.getHistoricoConversa(telefoneCliente);

    // 5. Montar system prompt
    const systemPrompt = this.buildSystemPrompt(
      tenant,
      cliente,
      servicos,
      agendamentosPassados,
      disponiveis,
      configuracoes,
    );

    // 6. Chamar Claude com tools
    const response = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...historicoMensagens,
        { role: 'user', content: mensagem },
      ],
      tools: this.getToolsDefinition(),
    });

    // 7. Processar resposta
    let resposta = '';

    for (const content of response.content) {
      if (content.type === 'text') {
        resposta += content.text;
      } else if (content.type === 'tool_use') {
        // Executar tool e adicionar resultado
        const toolResult = await this.executeTool(
          tenantId,
          cliente?.id,
          content.name,
          content.input,
        );

        // Se criou agendamento, formatar confirmação
        if (content.name === 'criar_agendamento' && toolResult.success) {
          resposta += `\n\n✅ Agendamento confirmado!\n\n${this.formatarConfirmacao(toolResult.agendamento)}`;
        }
      }
    }

    // 8. Salvar histórico
    await this.salvarHistorico(telefoneCliente, 'user', mensagem);
    await this.salvarHistorico(telefoneCliente, 'assistant', resposta);

    return resposta;
  }

  private async executeTool(
    tenantId: string,
    clienteId: string | undefined,
    toolName: string,
    input: any,
  ) {
    switch (toolName) {
      case 'criar_agendamento':
        return await this.agendamentosService.create({
          tenantId,
          clienteId: clienteId || input.clienteId,
          veiculoPlaca: input.veiculoPlaca,
          dataHora: new Date(input.dataHora),
          servicoIds: input.servicoIds,
          observacoes: input.observacoes,
        });

      case 'consultar_disponibilidade':
        return await this.agendamentosService.findAvailableSlots(
          tenantId,
          new Date(input.data),
        );

      case 'buscar_agendamentos_cliente':
        return await this.agendamentosService.findByCliente(clienteId);

      case 'cancelar_agendamento':
        return await this.agendamentosService.cancelar(input.agendamentoId);

      case 'listar_servicos':
        return await this.servicosService.findAll(tenantId);
    }
  }

  private getToolsDefinition() {
    return [
      {
        name: 'criar_agendamento',
        description: 'Cria um novo agendamento no sistema após confirmar todos os dados com o cliente',
        input_schema: {
          type: 'object',
          properties: {
            servicoIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'IDs dos serviços selecionados',
            },
            dataHora: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora do agendamento (ISO 8601)',
            },
            veiculoPlaca: {
              type: 'string',
              description: 'Placa do veículo (obrigatório)',
            },
            observacoes: {
              type: 'string',
              description: 'Observações adicionais do cliente (opcional)',
            },
          },
          required: ['servicoIds', 'dataHora', 'veiculoPlaca'],
        },
      },
      {
        name: 'consultar_disponibilidade',
        description: 'Consulta horários disponíveis em uma data específica',
        input_schema: {
          type: 'object',
          properties: {
            data: {
              type: 'string',
              format: 'date',
              description: 'Data para consultar (YYYY-MM-DD)',
            },
          },
          required: ['data'],
        },
      },
      // ... outras tools
    ];
  }
}
```

**Arquivos a criar:**
```
backend/src/whatsapp-bot/
  ├── whatsapp-bot.module.ts
  ├── bot.service.ts
  ├── whatsapp.controller.ts
  ├── whatsapp.service.ts (enviar mensagens)
  └── entities/conversa-historico.entity.ts

backend/src/evolution-api/
  ├── evolution-api.module.ts
  └── evolution-api.service.ts (client HTTP)
```

**Deployment Evolution API (Fly.io):**
```dockerfile
# Dockerfile
FROM node:20-alpine
RUN apk add --no-cache git
RUN git clone https://github.com/EvolutionAPI/evolution-api.git /app
WORKDIR /app
RUN npm install
EXPOSE 8080
CMD ["npm", "start"]
```

```toml
# fly.toml
app = "evolution-api-whatsapp"

[http_service]
  internal_port = 8080
  force_https = true

[[vm]]
  memory = '512mb'
  cpu_kind = 'shared'
  cpus = 1
```

---

#### 2.2 Notificações Automáticas (5 dias)
**Objetivo:** Enviar lembretes e confirmações automáticas.

**Tarefas:**
- [ ] Criar módulo `notificacoes` no backend
- [ ] Implementar cron job (NestJS `@Cron` decorator)
- [ ] Lembrete 1 dia antes do agendamento (9h da manhã)
- [ ] Confirmação imediata após criar agendamento
- [ ] Notificação ao lava-jato (novo agendamento via portal)
- [ ] Template de mensagens (personalizável por tenant)
- [ ] Logs de notificações enviadas (auditoria)
- [ ] Retry logic (se falhar, tentar novamente)
- [ ] Opt-out (cliente pode desativar notificações)

**Tipos de Notificação:**
1. **Confirmação:** Logo após criar agendamento
2. **Lembrete:** 1 dia antes às 9h
3. **Agradecimento:** Após concluir serviço (opcional)
4. **Feedback:** Pedir avaliação 1 dia após serviço (futuro)

**Implementação:**
```typescript
// backend/src/notificacoes/notificacoes.service.ts
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificacoesService {
  // Todo dia às 9h
  @Cron('0 9 * * *')
  async enviarLembretesAmanha() {
    const amanha = moment().add(1, 'day').startOf('day');
    const depoisAmanha = moment(amanha).endOf('day');

    const agendamentos = await this.agendamentosService.findMany({
      where: {
        dataHora: {
          gte: amanha.toDate(),
          lte: depoisAmanha.toDate(),
        },
        status: {
          in: ['PENDENTE', 'CONFIRMADO'],
        },
      },
      include: {
        cliente: true,
        veiculo: true,
        servicos: true,
        tenant: true,
      },
    });

    for (const agendamento of agendamentos) {
      // Verificar se já enviou lembrete
      const jaEnviou = await this.prisma.notificacao.findFirst({
        where: {
          agendamentoId: agendamento.id,
          tipo: 'LEMBRETE',
        },
      });

      if (jaEnviou) continue;

      // Enviar mensagem
      const mensagem = this.templateLembrete(agendamento);

      try {
        await this.whatsappService.enviarMensagem(
          agendamento.tenant.id,
          agendamento.cliente.telefone,
          mensagem,
        );

        // Registrar envio
        await this.prisma.notificacao.create({
          data: {
            agendamentoId: agendamento.id,
            tipo: 'LEMBRETE',
            canal: 'WHATSAPP',
            destinatario: agendamento.cliente.telefone,
            conteudo: mensagem,
            enviado: true,
            enviadoEm: new Date(),
          },
        });
      } catch (error) {
        // Log erro mas não falhar
        console.error('Erro ao enviar notificação:', error);
      }
    }
  }

  private templateLembrete(agendamento: any): string {
    return `
🚗 Lembrete de Agendamento - ${agendamento.tenant.nome}

Olá ${agendamento.cliente.nome}!

Você tem um agendamento amanhã:
📅 ${moment(agendamento.dataHora).format('DD/MM/YYYY')} às ${moment(agendamento.dataHora).format('HH:mm')}
🔧 Serviço: ${agendamento.servicos.map(s => s.nome).join(', ')}
🚗 Veículo: ${agendamento.veiculo.marca} ${agendamento.veiculo.modelo} (${agendamento.veiculo.placa})
💰 Valor: R$ ${agendamento.valorTotal.toFixed(2)}

Estamos te esperando! 😊

Caso precise cancelar ou reagendar, responda esta mensagem.
    `.trim();
  }

  async enviarConfirmacao(agendamento: any) {
    const mensagem = `
✅ Agendamento Confirmado - ${agendamento.tenant.nome}

Olá ${agendamento.cliente.nome}!

Seu agendamento foi confirmado com sucesso:
📅 ${moment(agendamento.dataHora).format('DD/MM/YYYY [às] HH:mm')}
🔧 ${agendamento.servicos.map(s => s.nome).join(', ')}
🚗 ${agendamento.veiculo.placa}
💰 R$ ${agendamento.valorTotal.toFixed(2)}

Endereço: ${agendamento.tenant.endereco || 'Consulte nosso site'}

Até breve! 🚗✨
    `.trim();

    await this.whatsappService.enviarMensagem(
      agendamento.tenant.id,
      agendamento.cliente.telefone,
      mensagem,
    );

    // Registrar
    await this.prisma.notificacao.create({
      data: {
        agendamentoId: agendamento.id,
        tipo: 'CONFIRMACAO',
        canal: 'WHATSAPP',
        destinatario: agendamento.cliente.telefone,
        conteudo: mensagem,
        enviado: true,
        enviadoEm: new Date(),
      },
    });
  }
}
```

**Schema Prisma (adicionar):**
```prisma
model Notificacao {
  id            String   @id @default(cuid())
  agendamentoId String
  agendamento   Agendamento @relation(fields: [agendamentoId], references: [id], onDelete: Cascade)
  tipo          String   // CONFIRMACAO, LEMBRETE, AGRADECIMENTO
  canal         String   // WHATSAPP, SMS, EMAIL
  destinatario  String
  conteudo      String   @db.Text
  enviado       Boolean  @default(false)
  enviadoEm     DateTime?
  erro          String?  @db.Text
  createdAt     DateTime @default(now())

  @@index([agendamentoId])
}
```

**Arquivos a criar:**
```
backend/src/notificacoes/
  ├── notificacoes.module.ts
  ├── notificacoes.service.ts
  └── templates/
      ├── lembrete.template.ts
      ├── confirmacao.template.ts
      └── agradecimento.template.ts
```

---

### **FASE 3: PROFISSIONALIZAÇÃO** (10 dias)

#### 3.1 Dashboard de Relatórios (5 dias)
**Objetivo:** Métricas e insights de negócio.

**Tarefas:**
- [ ] Criar página `/relatorios` no frontend
- [ ] Gráficos (usar recharts ou chart.js):
  - Faturamento mensal (últimos 6 meses)
  - Agendamentos por dia da semana
  - Serviços mais vendidos (top 5)
  - Taxa de cancelamento
  - Horários de pico
- [ ] Cards de KPIs:
  - Faturamento do mês
  - Total de agendamentos (mês)
  - Ticket médio
  - Taxa de retenção (clientes recorrentes)
- [ ] Filtros: período (última semana, mês, ano)
- [ ] Exportar relatórios (PDF ou Excel)
- [ ] Endpoints de analytics no backend

**Endpoints:**
```typescript
GET /analytics/faturamento?periodo=30d
GET /analytics/servicos-populares
GET /analytics/horarios-pico
GET /analytics/taxa-cancelamento
GET /analytics/clientes-recorrentes
```

---

#### 3.2 Gestão de Funcionários (3 dias)
**Objetivo:** Múltiplos atendentes, atribuir agendamentos.

**Tarefas:**
- [ ] Adicionar campo `atribuidoParaUserId` em Agendamento
- [ ] Criar página "Equipe" (listar usuários do tenant)
- [ ] Permitir OWNER convidar novos usuários (enviar email)
- [ ] Ao criar agendamento, selecionar funcionário
- [ ] No calendário, filtrar por funcionário
- [ ] Roles: OWNER (tudo), ADMIN (quase tudo), ATENDENTE (só agendamentos)

---

#### 3.3 Landing Page + Marketing (2 dias)
**Objetivo:** Página de vendas profissional.

**Tarefas:**
- [ ] Criar rota `/` (landing page pública, antes do login)
- [ ] Seções:
  - Hero: "Automatize seu lava-jato com IA"
  - Features: Bot WhatsApp, Portal do Cliente, Calendário, etc
  - Pricing: Cards de planos
  - Depoimentos (social proof)
  - CTA: "Testar Grátis por 14 Dias"
- [ ] Formulário de registro (captura email)
- [ ] Página `/login` separada da landing
- [ ] SEO: meta tags, sitemap, robots.txt
- [ ] Google Analytics

---

## 💰 CUSTOS MENSAIS (FLY.IO)

### Infraestrutura Base

**Para 1 Cliente (Tenant):**

1. **Backend API (NestJS):**
   - Máquina: `shared-cpu-1x` (256MB RAM)
   - Custo: **$1.94/mês** (~R$ 10/mês)
   - Quantidade: 1 instância

2. **Banco de Dados (PostgreSQL):**
   - Máquina: `shared-cpu-1x` (256MB RAM)
   - Storage: 1GB
   - Custo: **$0/mês** (Fly.io oferece 1 DB grátis)
   - Após 1 DB: ~$7/mês (~R$ 35/mês)

3. **Evolution API (WhatsApp):**
   - Máquina: `shared-cpu-1x` (512MB RAM)
   - Custo: **$1.94/mês** (~R$ 10/mês)
   - Quantidade: 1 instância compartilhada por todos

4. **Frontend (Next.js):**
   - **Opção A:** Vercel (grátis até 100GB bandwidth)
   - **Opção B:** Fly.io - $1.94/mês (~R$ 10/mês)
   - **Recomendado:** Vercel (grátis)

**TOTAL BASE (1 cliente):** ~R$ 20/mês
**TOTAL com DB pago:** ~R$ 55/mês

---

### Custos Adicionais

5. **Claude API (Anthropic):**
   - Modelo: Claude 3.5 Sonnet
   - Preço: $3 por 1M tokens de entrada, $15 por 1M tokens de saída
   - Estimativa: 100 conversas/mês = ~500K tokens
   - Custo: **~$2-5/mês** (~R$ 10-25/mês)

6. **Stripe (Pagamentos):**
   - Taxa: 4.99% + R$ 0.39 por transação
   - Exemplo: Assinatura de R$ 49 → R$ 2.84 de taxa
   - Custo: **variável** (descontado do que você recebe)

7. **Domínio (.com.br):**
   - Registro.br: **R$ 40/ano** (~R$ 3.33/mês)

8. **SSL (Let's Encrypt):**
   - **Grátis** (Fly.io já inclui)

---

### Escalabilidade

**Para 10 Clientes:**
- Backend: Mesmo servidor (aguenta fácil)
- DB: Mesmo servidor (256MB suficiente para ~50 tenants)
- Evolution API: Mesma instância
- Claude API: ~R$ 100-250/mês
- **Total:** ~R$ 150-300/mês

**Para 100 Clientes:**
- Backend: Upgrade para `shared-cpu-2x` (R$ 30/mês)
- DB: Upgrade para 1GB RAM + 10GB storage (R$ 80/mês)
- Evolution API: Mesma ou upgrade (R$ 20/mês)
- Claude API: ~R$ 1.000-2.500/mês
- **Total:** ~R$ 1.200-2.700/mês

**Breakeven (cobrar R$ 49/mês):**
- 1º cliente: lucro líquido ~R$ 20/mês (após custos)
- 10º cliente: lucro líquido ~R$ 200/mês
- 100º cliente: lucro líquido ~R$ 2.000/mês

---

### Otimizações de Custo

**Reduzir Claude API:**
- Cache de prompts (pode reduzir 50% do custo)
- Usar Haiku para conversas simples (10x mais barato)
- Limitar conversas no plano FREE (ex: 50/mês)

**Reduzir Infraestrutura:**
- Colocar frontend na Vercel (grátis)
- Usar Redis grátis (Upstash: 10k requests/dia)
- Horizontal scaling só quando necessário

---

### Comparação com Concorrentes

**Seu custo por cliente:** ~R$ 2-5/mês
**Seu preço de venda:** R$ 49/mês (BASIC)
**Margem:** ~90-95% 🤑

**Concorrentes:**
- Calendly: $10/mês (sem WhatsApp, sem IA)
- Setmore: $5-12/mês (genérico)
- Eles têm custos similares mas cobram em dólar

---

## 📊 ANÁLISE DE VIABILIDADE

### Estimativa de Receita (12 meses)

**Cenário Conservador:**
```
Mês 1:  2 clientes  × R$ 49 = R$    98 | Custo: R$   50 | Lucro: R$    48
Mês 2:  5 clientes  × R$ 49 = R$   245 | Custo: R$   80 | Lucro: R$   165
Mês 3:  10 clientes × R$ 49 = R$   490 | Custo: R$  120 | Lucro: R$   370
Mês 6:  25 clientes × R$ 49 = R$ 1.225 | Custo: R$  250 | Lucro: R$   975
Mês 12: 50 clientes × R$ 49 = R$ 2.450 | Custo: R$  500 | Lucro: R$ 1.950
```

**MRR (Monthly Recurring Revenue) em 12 meses:** R$ 2.450/mês
**Lucro líquido mensal:** ~R$ 1.950/mês

**Churn assumido:** 10%/mês (padrão SaaS early-stage)

---

### Investimento Inicial

**Tempo de Desenvolvimento:** 60 dias (2 meses)

**Opção 1: Você fazendo sozinho**
- Custo: R$ 0 (seu tempo)
- Oportunidade: 2 meses sem receita de freela

**Opção 2: Contratar dev**
- Freela: R$ 100/hora × 320h = R$ 32.000
- Ou: R$ 8.000/mês × 2 meses = R$ 16.000

**Custos de Setup:**
- Domínio: R$ 40/ano
- Fly.io (testes): R$ 100 (primeiro mês)
- Stripe test mode: R$ 0
- Claude API test: R$ 0 (créditos grátis)
- **Total:** ~R$ 140

---

### Payback

**Se você desenvolver:**
- Investimento: R$ 140
- Após 3 meses (10 clientes): já recuperou + lucro de R$ 1.000

**Se contratar:**
- Investimento: R$ 16.000
- Após 12 meses (50 clientes): recuperou investimento
- Após 18 meses: lucro acumulado de ~R$ 20.000

---

## 🎯 TASKS PARA HOJE (14/01/2026)

### Foco: Fundação SaaS (8 horas de trabalho)

#### MANHÃ (4h) - Autenticação Básica

**Task 1: Setup Prisma com Tenant + User (1.5h)**
- [ ] Backup do banco atual: `cp backend/prisma/dev.db backend/prisma/dev.db.backup`
- [ ] Adicionar models `Tenant` e `User` no `schema.prisma`
- [ ] Adicionar campo `tenantId` em: `Cliente`, `Veiculo`, `Servico`, `Agendamento`, `BloqueioHorario`, `Configuracao`
- [ ] Rodar `npx prisma migrate dev --name add-multi-tenancy`
- [ ] Rodar `npx prisma generate`

**Task 2: Criar Tenant Default + Migration Script (1h)**
- [ ] Criar seed script `backend/prisma/seed-tenant.ts`
- [ ] Criar tenant "Demo" com slug "demo"
- [ ] Migrar todos os dados existentes para `tenantId = demo.id`
- [ ] Criar usuário admin padrão (email: admin@demo.com, senha: admin123)
- [ ] Rodar seed: `npx prisma db seed`

**Task 3: Módulo Auth Básico (1.5h)**
- [ ] `npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt`
- [ ] Criar estrutura:
  ```
  backend/src/auth/
    ├── auth.module.ts
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── dto/login.dto.ts
    └── jwt.strategy.ts
  ```
- [ ] Implementar endpoint `POST /auth/login` (retorna JWT)
- [ ] Testar com Insomnia/Postman

---

#### TARDE (4h) - Isolamento de Dados

**Task 4: Criar TenantGuard (1h)**
- [ ] Criar `backend/src/auth/tenant.guard.ts`
- [ ] Aplicar guard globalmente em `app.module.ts`
- [ ] Testar: fazer request sem token → deve retornar 401
- [ ] Testar: fazer request com token → deve injetar `req.tenantId`

**Task 5: Atualizar Services para Filtrar por Tenant (2h)**
- [ ] Atualizar `clientes.service.ts`: adicionar `where: { tenantId }` em todos os métodos
- [ ] Atualizar `veiculos.service.ts`: idem
- [ ] Atualizar `servicos.service.ts`: idem
- [ ] Atualizar `agendamentos.service.ts`: idem
- [ ] Testar cada endpoint com token JWT
- [ ] Verificar que dados estão isolados por tenant

**Task 6: Frontend - Página de Login (1h)**
- [ ] Criar `frontend/app/(auth)/login/page.tsx`
- [ ] Formulário: email + senha
- [ ] Chamar `POST /auth/login`
- [ ] Salvar JWT no localStorage
- [ ] Redirecionar para `/` após login
- [ ] Criar `lib/auth.ts` (helper para pegar token)
- [ ] Atualizar `lib/api.ts`: adicionar header `Authorization: Bearer ${token}`

---

#### NOITE (Opcional - 2h) - Testes

**Task 7: Validar Multi-tenancy (2h)**
- [ ] Criar segundo tenant via seed
- [ ] Criar clientes para cada tenant
- [ ] Fazer login com user do tenant A
- [ ] Verificar que só vê dados do tenant A
- [ ] Fazer login com user do tenant B
- [ ] Verificar que só vê dados do tenant B
- [ ] Sucesso = Multi-tenancy funcionando! 🎉

---

## 🚀 PRÓXIMOS DIAS

**Dia 2 (15/01):** Portal do Cliente (rota pública)
**Dia 3 (16/01):** Sistema de Pagamento Stripe
**Dia 4-5 (17-18/01):** WhatsApp Bot com Claude API
**Semana 2:** Notificações + Relatórios
**Semana 3:** Polish + Deploy + Testes
**Semana 4:** Marketing + Landing Page

---

## 📚 REFERÊNCIAS

### Documentação Importante
- **Fly.io:** https://fly.io/docs/
- **Prisma Multi-tenancy:** https://www.prisma.io/docs/guides/database/multi-tenancy
- **NestJS JWT:** https://docs.nestjs.com/security/authentication
- **Stripe API:** https://stripe.com/docs/api
- **Evolution API:** https://doc.evolution-api.com/
- **Claude API:** https://docs.anthropic.com/claude/reference/getting-started-with-the-api
- **Anthropic Tool Use:** https://docs.anthropic.com/claude/docs/tool-use

### Custos e Pricing
- **Fly.io Pricing:** https://fly.io/docs/about/pricing/
- **Claude Pricing:** https://www.anthropic.com/pricing
- **Stripe Pricing Brasil:** https://stripe.com/br/pricing

---

## 🎯 DIFERENCIAL COMPETITIVO

**Por que você vai ganhar:**

1. ✨ **Agente de IA no WhatsApp**
   - Nenhum concorrente brasileiro tem isso
   - WhatsApp é 99% dos lava-jatos
   - Cliente agenda em 30 segundos via chat

2. 📱 **Portal do Cliente**
   - Agendamento online 24/7
   - Reduz ligações/mensagens
   - Experiência moderna

3. 💰 **Preço Acessível**
   - R$ 49/mês vs. concorrentes em dólar
   - Trial grátis de 14 dias
   - Sem taxa de setup

4. 🎨 **Design Superior**
   - Nota 8.5/10 (você já tem)
   - Concorrentes têm design anos 2000
   - Mobile-first (maioria usa celular)

5. 🇧🇷 **Focado no Brasil**
   - WhatsApp integrado
   - PIX (futuro)
   - Português nativo
   - Suporte local

**Pitch Elevator:**
> "Automatize seu lava-jato com IA. Cliente agenda via WhatsApp em 30 segundos, você recebe confirmação automática e lembrete é enviado. Simples, rápido e barato: R$ 49/mês."

---

## 🏁 CONCLUSÃO

**Estado Atual:** MVP funcional com design excepcional (8.5/10)

**Para ser vendável:** Precisa de autenticação, multi-tenancy, pagamento e WhatsApp Bot

**Tempo estimado:** 60 dias de desenvolvimento focado

**Investimento:** ~R$ 140 (infra) + seu tempo

**Potencial de receita:** R$ 2.500/mês em 12 meses (50 clientes)

**Vantagem competitiva:** Único com IA no WhatsApp + design moderno + preço BR

**Recomendação:** Comece HOJE com autenticação (Task 1-7 acima), depois faça WhatsApp Bot (diferencial), depois resto.

---

**Última atualização:** 2026-01-14
**Versão:** 1.0
**Autor:** Análise Técnica Completa
