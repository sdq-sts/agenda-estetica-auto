# n8n - Workflow Automation

Configuração do n8n para desenvolvimento local e deploy no Railway.

## 🚀 Quick Start

### Local (Docker Compose)

```bash
# Na raiz do projeto
docker compose up -d n8n

# Acessar
open http://localhost:5678
```

**Credenciais (primeira vez):**
- Crie um usuário admin no primeiro acesso
- Email e senha de sua escolha

### Produção (Railway)

#### Opção 1: Dashboard (Recomendado)

1. **Criar Service:**
   - Dashboard → Projeto → **"+ New"** → **"Empty Service"**
   - Nome: `n8n`

2. **Configurar Docker Image:**
   - Settings → **Deploy** → **Source: Docker Image**
   - Image: `n8nio/n8n:latest`
   - Port: `5678`

3. **Adicionar Variáveis:**
   ```
   DB_TYPE=postgresdb
   DB_POSTGRESDB_DATABASE=n8n
   DB_POSTGRESDB_HOST=postgres.railway.internal
   DB_POSTGRESDB_PORT=5432
   DB_POSTGRESDB_USER=postgres
   DB_POSTGRESDB_PASSWORD=${PGPASSWORD}  // Referência ao Postgres

   N8N_HOST=0.0.0.0
   N8N_PORT=5678
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://seu-n8n.railway.app
   N8N_EDITOR_BASE_URL=https://seu-n8n.railway.app
   N8N_ENCRYPTION_KEY=gere-chave-aleatoria-32-chars-min

   GENERIC_TIMEZONE=America/Sao_Paulo
   TZ=America/Sao_Paulo

   EXECUTIONS_DATA_PRUNE=true
   EXECUTIONS_DATA_MAX_AGE=336
   ```

4. **Adicionar Referência ao PostgreSQL:**
   - Variables → **"New Variable"** → **"Add Reference"**
   - Variable Name: `DB_POSTGRESDB_PASSWORD`
   - Service: `Postgres`
   - Variable: `PGPASSWORD` ou `POSTGRES_PASSWORD`

5. **Gerar Domínio:**
   - Settings → Networking → **Generate Domain**
   - Copie a URL gerada
   - Volte em Variables e atualize `WEBHOOK_URL` e `N8N_EDITOR_BASE_URL`

6. **Deploy!**

#### Opção 2: CLI (Parcial)

```bash
cd n8n
chmod +x deploy-railway.sh
./deploy-railway.sh
```

**Nota:** O script configura as variáveis mas você ainda precisa:
- Adicionar a referência do password no dashboard
- Configurar Docker Image no dashboard
- Gerar domínio público

## 🔗 Integrações

### Conectar com Backend (Webhooks)

O n8n pode receber webhooks do backend para automações:

**Exemplo: Notificar novo agendamento**

1. No n8n, crie um workflow com trigger "Webhook"
2. Copie a URL do webhook
3. No backend, adicione chamada POST para a URL ao criar agendamento

### Conectar com Evolution API (WhatsApp)

1. No n8n, use o node "HTTP Request"
2. Configure para chamar a Evolution API:
   - URL: `http://evolution:8080` (local) ou `https://seu-evolution.railway.app` (produção)
   - Headers: `apikey: seu-api-key`

## 📊 Database

O n8n usa o **mesmo PostgreSQL** que o backend:

```
PostgreSQL (Railway)
├── railway (backend)
├── n8n (automações)  ← Este
└── evolution (WhatsApp)
```

Compartilhar o banco economiza $1-2/mês! 💰

## 🛠️ Manutenção

### Logs (Local)

```bash
docker compose logs n8n -f
```

### Logs (Railway)

```bash
cd n8n
railway logs
```

### Backup de Workflows

Workflows são salvos no database `n8n`. Para backup:

```bash
# Local
docker exec agenda-postgres pg_dump -U postgres n8n > backup-n8n.sql

# Railway
railway run pg_dump $DATABASE_URL > backup-n8n.sql
```

## 💡 Dicas

1. **Execuções antigas:** Configure `EXECUTIONS_DATA_MAX_AGE` para limpar execuções antigas automaticamente
2. **Segurança:** Em produção, use autenticação forte e HTTPS
3. **Webhook URL:** Sempre use a URL pública do Railway, não localhost

## 🔐 Segurança

- ✅ Nunca commite `N8N_ENCRYPTION_KEY` no Git
- ✅ Use variáveis de ambiente do Railway
- ✅ Ative 2FA no n8n em produção
- ✅ Restrinja acesso por IP se possível
