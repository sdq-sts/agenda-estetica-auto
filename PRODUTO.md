# Produto - Agenda Estética Auto

> Sistema de agendamento para estética automotiva
>
> **Cliente piloto:** Edu Estética Automotiva
> **Valor:** R$ 150/mês
> **Objetivo:** Substituir agenda manual por sistema profissional

---

## 📸 Situação Atual (Manual)

O cliente usa uma imagem estática com:
- Grade semanal (Segunda a Sábado)
- Horários fixos: 08:00, 10:30, 14:00, 16:30
- Marcações manuais de "OCUPADO" em vermelho
- Atendimento via WhatsApp
- Política: pagamento antecipado + taxa de 50% para cancelamento

**Problemas:**
- ❌ Precisa refazer a imagem toda semana
- ❌ Cliente não tem histórico
- ❌ Sem controle de serviços realizados
- ❌ Difícil visualizar faturamento
- ❌ Sem lembretes automáticos
- ❌ Gestão de clientes dispersa no WhatsApp

---

## ✅ O que está PRONTO (v1.0)

### 1. Gestão de Clientes
**Status:** ✅ Completo

**Funcionalidades:**
- ✅ Cadastrar cliente (nome, telefone, WhatsApp, email, observações)
- ✅ Listar todos os clientes
- ✅ Editar informações do cliente
- ✅ Deletar cliente
- ✅ Visualizar quantos veículos cada cliente tem
- ✅ Visualizar quantos agendamentos cada cliente tem
- ✅ Badge de observações (ex: "Cliente VIP - Prefere atendimento matutino")

**Telas:**
- `/clientes` - Lista com cards, busca, filtros

---

### 2. Gestão de Veículos
**Status:** ✅ Completo

**Funcionalidades:**
- ✅ Cadastrar veículo (marca, modelo, ano, placa, cor, cliente)
- ✅ Listar todos os veículos
- ✅ Editar veículo
- ✅ Deletar veículo
- ✅ Vincular veículo ao cliente
- ✅ Visualizar histórico de veículos por cliente

**Telas:**
- `/veiculos` - Lista com cards mostrando placa, ano, cor, dono

---

### 3. Catálogo de Serviços
**Status:** ✅ Completo

**Funcionalidades:**
- ✅ Cadastrar serviço (nome, descrição, categoria, duração, preço)
- ✅ Listar serviços
- ✅ Editar serviço
- ✅ Deletar serviço (soft delete - marca como inativo)
- ✅ Categorização (Proteção, Higienização, Lavagem, Polimento, Teste)
- ✅ Duração em minutos
- ✅ Preço em reais

**Serviços cadastrados (exemplo):**
- Cristalização de Vidros - R$ 200,00 (45min)
- Higienização Interna - R$ 150,00 (90min)
- Lavagem Completa - R$ 100,00 (60min)
- Lavagem Simples - R$ 50,00 (30min)
- Polimento Técnico - R$ 300,00 (120min)

**Telas:**
- `/servicos` - Grid de cards com preços e durações

---

### 4. Agendamentos
**Status:** ✅ Funcional (precisa melhorar)

**Funcionalidades:**
- ✅ Criar agendamento (data, hora, cliente, veículo, serviços, observações)
- ✅ Listar agendamentos
- ✅ Status: Pendente, Confirmado, Concluído, Cancelado
- ✅ Múltiplos serviços por agendamento
- ✅ Cálculo automático do valor total
- ✅ Visualização de observações
- ✅ Badge colorido por status

**Telas:**
- `/agendamentos` - Lista timeline

---

### 5. Dashboard Home
**Status:** ✅ Completo

**Funcionalidades:**
- ✅ Cards de estatísticas (clientes, veículos, serviços, agendamentos)
- ✅ Acesso rápido às 4 seções principais
- ✅ Design moderno (8.5/10)

---

## 🎯 O que FALTA para substituir a agenda manual

### CRÍTICO (Sem isso não substitui)

#### 1. **Visualização em Grade Semanal** 🔴 URGENTE
**Problema:** Atualmente só tem lista de agendamentos
**Solução:** Criar view de calendário semanal igual à imagem

```
Funcionalidades necessárias:
- Grade semanal (Segunda a Sábado)
- Horários configuráveis (padrão: 08:00, 10:30, 14:00, 16:30)
- Cores por status (Pendente=amarelo, Confirmado=azul, Cancelado=vermelho)
- Clicar no slot vazio = criar novo agendamento
- Clicar no agendamento = ver detalhes/editar
- Navegação entre semanas (< Anterior | Próxima >)
```

**Impacto:** SEM ISSO O PRODUTO NÃO SERVE

---

#### 2. **Bloqueio de Horários** 🔴 URGENTE
**Problema:** Não tem como bloquear horários já ocupados
**Solução:** Sistema de disponibilidade

```
Funcionalidades:
- Ao criar agendamento, validar se horário está livre
- Considerar duração do serviço (ex: serviço de 90min ocupa 2 slots)
- Mostrar "OCUPADO" em vermelho na grade
- Permitir sobrepor apenas se for urgência (flag especial)
```

**Impacto:** Evita dupla marcação (problema atual)

---

#### 3. **WhatsApp Integration** 🟡 IMPORTANTE
**Problema:** Cliente ainda precisa confirmar tudo pelo WhatsApp
**Solução:** Enviar mensagens automáticas

```
Momentos para enviar WhatsApp:
1. Agendamento criado → "Olá {cliente}, seu agendamento foi confirmado para {data} às {hora}. Serviços: {lista}. Total: R$ {valor}"
2. 1 dia antes → "Lembrete: amanhã você tem agendamento às {hora}"
3. Cancelamento → "Seu agendamento foi cancelado. Taxa de 50% será cobrada."

Tecnologia:
- Opção 1: Baileys (WhatsApp Web API)
- Opção 2: Twilio (pago mas mais estável)
- Opção 3: Evolution API (self-hosted)
```

**Impacto:** Reduz 80% das mensagens manuais

---

#### 4. **Pagamento Antecipado** 🟡 IMPORTANTE
**Problema:** Não tem controle se cliente pagou
**Solução:** Status de pagamento

```
Adicionar ao agendamento:
- statusPagamento: "pendente" | "pago" | "reembolsado"
- formaPagamento: "pix" | "dinheiro" | "cartao"
- valorPago: number
- dataPagamento: Date

No card do agendamento mostrar:
- Badge verde: "PAGO"
- Badge vermelho: "AGUARDANDO PAGAMENTO"
```

**Impacto:** Evita confusão sobre quem pagou

---

#### 5. **Política de Cancelamento** 🟡 IMPORTANTE
**Problema:** Não tem regra de cancelamento automático
**Solução:** Sistema de cancelamento com taxa

```
Regras:
- Cancelar com 24h+ de antecedência = sem taxa
- Cancelar com -24h = taxa de 50%
- No-show = taxa de 100%

Funcionalidades:
- Botão "Cancelar agendamento" com confirmação
- Calcular automaticamente a taxa baseado no horário
- Registrar motivo do cancelamento
- Gerar relatório de cancelamentos
```

**Impacto:** Reduz no-shows

---

### MELHORIAS (Nice to have, mas agregam muito valor)

#### 6. **Relatórios Financeiros** 🟢 DESEJÁVEL
```
Dashboards:
- Faturamento do mês (gráfico de linha)
- Serviços mais vendidos (gráfico de barras)
- Taxa de ocupação (% de horários preenchidos)
- Clientes recorrentes vs novos
- Ticket médio por cliente

Filtros:
- Por período (semana, mês, ano)
- Por serviço
- Por cliente
```

**Impacto:** Decisões baseadas em dados

---

#### 7. **Histórico do Cliente** 🟢 DESEJÁVEL
```
Na tela do cliente, mostrar:
- Último agendamento
- Total gasto (lifetime value)
- Serviços preferidos
- Frequência de visitas
- Veículos cadastrados
- Observações importantes

Timeline:
- 13/01/2026 - Lavagem Completa + Polimento - R$ 400
- 15/12/2025 - Higienização Interna - R$ 150
- 20/11/2025 - Cristalização - R$ 200
```

**Impacto:** Atendimento personalizado

---

#### 8. **Notificações Push** 🟢 DESEJÁVEL
```
Para o dono da estética:
- "Novo agendamento: João Silva às 14:00"
- "Lembrete: atendimento em 30 minutos"
- "Cliente não compareceu ao agendamento"

Para o cliente (via WhatsApp):
- 24h antes do agendamento
- 2h antes do agendamento
- Agendamento confirmado
```

**Impacto:** Ninguém esquece compromissos

---

#### 9. **Checkout Rápido** 🟢 DESEJÁVEL
```
Ao concluir agendamento, tela de:
- Serviços realizados ✓
- Produtos utilizados (se tiver)
- Valor total
- Botão "Gerar PIX"
- Botão "Marcar como pago"
- Imprimir recibo (opcional)
```

**Impacto:** Profissionalismo no fechamento

---

#### 10. **Mobile App (PWA)** 🟢 DESEJÁVEL
```
Transformar em PWA:
- Instalar no celular
- Funciona offline (cache de dados)
- Notificações push nativas
- Ícone na home screen

Benefícios:
- Cliente acessa de qualquer lugar
- Experiência de app nativo
- Sem precisar publicar na App Store/Play Store
```

**Impacto:** Acessibilidade e conveniência

---

## 📊 Priorização (Para entregar v2.0)

### Sprint 1 - CRÍTICO (2-3 dias) 🔴
1. ✅ **Calendário Semanal** - View de grade igual à imagem
2. ✅ **Bloqueio de Horários** - Validação de disponibilidade
3. ✅ **Status de Pagamento** - Controle de quem pagou

### Sprint 2 - IMPORTANTE (3-4 dias) 🟡
4. ✅ **WhatsApp Integration** - Mensagens automáticas
5. ✅ **Política de Cancelamento** - Taxa automática
6. ✅ **Histórico do Cliente** - Timeline de atendimentos

### Sprint 3 - DESEJÁVEL (2-3 dias) 🟢
7. ✅ **Relatórios Financeiros** - Dashboard com métricas
8. ✅ **Checkout Rápido** - Tela de finalização
9. ✅ **PWA** - Transformar em app instalável

---

## 💰 Proposta de Valor (Pitch para o cliente)

### Benefícios Imediatos:
1. ✅ **Acaba com a agenda manual** - Nunca mais refazer imagem toda semana
2. ✅ **Histórico completo** - Saber exatamente o que fez em cada cliente
3. ✅ **Menos WhatsApp** - Sistema envia mensagens automáticas
4. ✅ **Controle financeiro** - Ver faturamento em tempo real
5. ✅ **Profissionalismo** - Cliente vê que você tem sistema próprio
6. ✅ **Mobile-friendly** - Acessar de qualquer celular

### ROI (Retorno sobre investimento):
```
Custo: R$ 150/mês

Economia estimada:
- 5h/mês refazendo agenda manual = R$ 250 (R$ 50/hora)
- 3h/mês mandando lembretes no WhatsApp = R$ 150
- 2h/mês organizando planilhas = R$ 100
= Total economizado: R$ 500/mês

ROI: 233% (economiza R$ 350/mês pagando R$ 150)
```

### Diferencial Competitivo:
- Agenda visual igual à que já usa (zero curva de aprendizado)
- Design moderno (8.5/10) - melhor que concorrentes
- Feito sob medida para estética automotiva
- Suporte direto com você (desenvolvedor)

---

## 🚀 Roadmap de Funcionalidades Futuras

### v3.0 - Expansão (Se der certo)
- Multi-usuário (vários atendentes)
- Comissões por atendente
- Gestão de estoque (produtos usados)
- Programa de fidelidade
- Integração com Pix automático
- QR Code para check-in
- Avaliação pós-atendimento
- Marketing: cupons de desconto

### v4.0 - Escalabilidade (Se virar SaaS real)
- Multi-tenant (vários clientes)
- Planos: Basic, Pro, Enterprise
- Marketplace de serviços
- API pública
- White-label
- Franquias

---

## 📝 Próximos Passos

1. **Validar priorização com o cliente**
   - Mostrar este documento
   - Perguntar: "Qual dessas funcionalidades você mais sente falta?"
   - Ajustar roadmap baseado no feedback

2. **Implementar Sprint 1** (Calendário + Bloqueio + Pagamento)
   - Essencial para substituir a agenda manual
   - 2-3 dias de desenvolvimento

3. **Deploy em produção**
   - Subir em Vercel (frontend) + Railway (backend)
   - Domínio próprio (ex: agenda.esteticaedu.com.br)
   - SSL automático

4. **Treinamento do cliente**
   - 1h de call explicando o sistema
   - Gravar vídeo tutorial
   - WhatsApp para suporte

5. **Monitorar uso real**
   - Analytics básico (quantos agendamentos/dia)
   - Feedback semanal
   - Iterar baseado no uso

---

## 🎯 Meta de Sucesso

**Objetivo:** Cliente usar 100% no sistema e 0% na agenda manual

**Métricas:**
- 30 dias após deploy: 80% dos agendamentos no sistema
- 60 dias: 100% no sistema, agenda manual descontinuada
- 90 dias: Cliente indicando para outros donos de estética

**Caso de sucesso:**
> "Antes eu gastava 1h toda semana refazendo a agenda e mais 3h mandando lembrete. Agora o sistema faz tudo. Só olho o celular e vejo quem vem hoje. Economizei R$ 350/mês em tempo e ainda tenho relatório de tudo que faturei."

---

**Última atualização:** 2026-01-13
**Versão atual:** v1.0 (Base funcional)
**Próxima versão:** v2.0 (Calendário + WhatsApp + Pagamento)
