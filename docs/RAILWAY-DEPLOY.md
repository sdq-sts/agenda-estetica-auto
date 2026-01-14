# 🚂 Deploy no Railway - Guia Completo

## 📋 Visão Geral

Este guia mostra como fazer deploy da aplicação no Railway usando o **Free Tier** ($5 crédito/mês).

### Arquitetura no Railway:

```
Railway Project: agenda-estetica-auto
├── PostgreSQL (Plugin - $0 dentro do free tier)
├── Backend NestJS (Service - usa ~$2-3 do crédito)
├── Evolution API (Service - usa ~$2-3 do crédito)
└── Frontend Next.js → Vercel (melhor opção)
```

---

## 🎯 Fase 1: Setup Inicial (10 min)

### 1. Criar conta Railway

1. Acesse [railway.app](https://railway.app)
2. Login com GitHub
3. Verificar email
4. **Importante:** Adicionar cartão de crédito para desbloquear free tier ($5/mês)

### 2. Criar novo projeto

```
1. Dashboard → "New Project"
2. Nome: "agenda-estetica-auto"
3. Criar
```

---

## 📦 Fase 2: Deploy dos Serviços

### Serviço 1: PostgreSQL Database

```
1. No projeto → "+ New"
2. Selecionar "Database" → "Add PostgreSQL"
3. Aguardar provisionar (~1 min)
4. ✅ Database criado!
```

**Variáveis geradas automaticamente:**
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `DATABASE_URL` (conexão string completa)

---

### Serviço 2: Backend NestJS

#### 2.1 Adicionar serviço

```
1. No projeto → "+ New"
2. Selecionar "GitHub Repo"
3. Conectar repositório: agenda-estetica-auto
4. Nome do serviço: "backend"
```

#### 2.2 Configurar build

```
Settings → Build:
- Root Directory: backend
- Build Command: npm install && npx prisma generate && npm run build
- Start Command: npx prisma migrate deploy && npm run start:prod
```

#### 2.3 Adicionar variáveis de ambiente

```
Variables → Add Variables:

# Database (reference do PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=<GERAR_RANDOM_STRING_32_CHARS>
JWT_EXPIRES_IN=7d

# Evolution API (vai adicionar depois)
EVOLUTION_API_URL=http://evolution.railway.internal:8080
EVOLUTION_API_KEY=<GERAR_RANDOM_STRING>

# App
NODE_ENV=production
PORT=3333
```

**Gerar strings aleatórias:**
```bash
# JWT_SECRET (32 chars)
openssl rand -base64 32

# EVOLUTION_API_KEY (16 chars)
openssl rand -hex 16
```

#### 2.4 Deploy

```
1. Settings → Networking
2. Gerar domínio público
3. Copiar URL (ex: backend-production-xxxx.railway.app)
4. Deploy automático quando push no GitHub
```

---

### Serviço 3: Evolution API (WhatsApp)

#### 3.1 Adicionar serviço

```
1. No projeto → "+ New"
2. Selecionar "Empty Service"
3. Nome: "evolution"
```

#### 3.2 Configurar Docker

```
Settings → Source:
- Deployment Source: "Docker Image"
- Image: atendai/evolution-api:latest
```

#### 3.3 Adicionar variáveis de ambiente

```
Variables → Add Variables:

# Server
SERVER_TYPE=http
SERVER_PORT=8080

# CORS
CORS_ORIGIN=*
CORS_METHODS=POST,GET,PUT,DELETE
CORS_CREDENTIALS=true

# Database (usa o mesmo PostgreSQL)
DATABASE_ENABLED=true
DATABASE_CONNECTION_URI=${{Postgres.DATABASE_URL}}/evolution
DATABASE_CONNECTION_CLIENT_NAME=evolution_db
DATABASE_SAVE_DATA_INSTANCE=true
DATABASE_SAVE_DATA_NEW_MESSAGE=true
DATABASE_SAVE_MESSAGE_UPDATE=true
DATABASE_SAVE_DATA_CONTACTS=true
DATABASE_SAVE_DATA_CHATS=true

# Authentication (mesmo valor do backend)
AUTHENTICATION_API_KEY=<MESMO_DO_BACKEND_EVOLUTION_API_KEY>
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true

# Webhook (para n8n no futuro)
WEBHOOK_GLOBAL_URL=
WEBHOOK_GLOBAL_ENABLED=false

# Log
LOG_LEVEL=ERROR,WARN,INFO
LOG_COLOR=false
LOG_BAILEYS=error

# QR Code
QRCODE_LIMIT=30
QRCODE_COLOR=#198754

# Instance
DEL_INSTANCE=false
```

#### 3.4 Configurar porta

```
Settings → Networking:
- Port: 8080
- Gerar domínio público
- Copiar URL (ex: evolution-production-xxxx.railway.app)
```

#### 3.5 Conectar WhatsApp

```
1. Abrir URL do Evolution: https://evolution-production-xxxx.railway.app
2. Acessar: /instance/connect/agenda-estetica
3. Headers:
   - apikey: <SEU_EVOLUTION_API_KEY>
4. Escanear QR Code com WhatsApp
5. ✅ Conectado!
```

---

## 🔗 Fase 3: Conectar os Serviços

### Atualizar Backend com URL do Evolution

```
Backend → Variables:
EVOLUTION_API_URL=https://evolution-production-xxxx.railway.app

(Substituir xxxx pelo seu domínio)
```

### Verificar comunicação

```bash
# Testar backend
curl https://backend-production-xxxx.railway.app/health

# Testar evolution
curl https://evolution-production-xxxx.railway.app \
  -H "apikey: SEU_API_KEY"
```

---

## 🌐 Fase 4: Deploy Frontend (Vercel)

### Por que Vercel e não Railway?

- ✅ Free tier mais generoso
- ✅ Especializado em Next.js
- ✅ CDN global
- ✅ Zero config

### Deploy no Vercel

```
1. Acesse vercel.com
2. Login com GitHub
3. "Import Project" → selecionar repo
4. Root Directory: frontend
5. Environment Variables:
   NEXT_PUBLIC_API_URL=https://backend-production-xxxx.railway.app
6. Deploy!
```

---

## ✅ Fase 5: Testar Tudo

### 1. Testar Backend

```bash
# Health check
curl https://backend-production-xxxx.railway.app/health

# Login
curl -X POST https://backend-production-xxxx.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","senha":"admin123"}'
```

### 2. Testar Evolution

```bash
# Status da instância
curl https://evolution-production-xxxx.railway.app/instance/connectionState/agenda-estetica \
  -H "apikey: SEU_API_KEY"
```

### 3. Testar WhatsApp Integration

```bash
# Enviar mensagem de teste
curl -X POST https://backend-production-xxxx.railway.app/api/agendamentos \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "...",
    "dataHora": "2026-01-20T14:00:00",
    "servicos": [{"servicoId": "...", "preco": 100}]
  }'

# Deve enviar WhatsApp automático! 🎉
```

---

## 💰 Custos Esperados

### Railway Free Tier ($5/mês grátis):

```
PostgreSQL: $0 (incluso)
Backend:     ~$2-3/mês
Evolution:   ~$2-3/mês
─────────────────────────
Total:       $0/mês (dentro do free tier!) 🎉
```

**Dica:** Se ultrapassar os $5, você pode:
1. Reduzir replicas (1 replica só)
2. Parar serviços não usados
3. Otimizar queries do banco

---

## 🐛 Troubleshooting

### Erro: Backend não conecta no PostgreSQL

```bash
# Verificar DATABASE_URL
railway variables

# Testar conexão
railway run npx prisma db push
```

### Erro: Evolution não conecta

```bash
# Verificar logs
railway logs -s evolution

# Verificar se porta está exposta
railway service -s evolution
```

### Erro: WhatsApp desconecta

```bash
# Reconectar
curl https://evolution-production-xxxx.railway.app/instance/connect/agenda-estetica \
  -H "apikey: SEU_API_KEY"

# Escanear QR Code novamente
```

---

## 🚀 Próximos Passos

### Adicionar n8n (Futuro - Sprint 3)

Quando quiser adicionar chatbot conversacional:

```
1. Railway → "+ New" → "Empty Service"
2. Nome: "n8n"
3. Docker Image: n8nio/n8n:latest
4. Port: 5678
5. Variables: (ver guia específico)
```

**Custo adicional:** ~$3-5/mês

---

## 📝 Checklist Final

- [ ] PostgreSQL criado e conectado
- [ ] Backend deployado e funcionando
- [ ] Evolution API rodando
- [ ] WhatsApp conectado (QR Code escaneado)
- [ ] Frontend no Vercel apontando pro backend
- [ ] Teste de envio de mensagem funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Domínios públicos gerados

---

## 🆘 Suporte

**Problemas?** Verificar:
1. Logs do Railway: `railway logs`
2. Variáveis de ambiente: `railway variables`
3. Status dos serviços: Dashboard Railway
4. Conexão WhatsApp: Evolution API dashboard

**Documentação:**
- Railway: https://docs.railway.app
- Evolution API: https://doc.evolution-api.com
- Prisma: https://www.prisma.io/docs
