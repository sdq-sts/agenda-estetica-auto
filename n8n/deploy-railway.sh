#!/bin/bash
set -e

echo "🚀 Deploying n8n to Railway..."

# Verificar se está no diretório correto
cd "$(dirname "$0")"

# Criar service se não existir
echo "📦 Creating n8n service..."
railway service || railway link

# Configurar variáveis de ambiente
echo "⚙️  Setting environment variables..."

railway variables set DB_TYPE=postgresdb
railway variables set DB_POSTGRESDB_DATABASE=n8n
railway variables set DB_POSTGRESDB_HOST=postgres.railway.internal
railway variables set DB_POSTGRESDB_PORT=5432
railway variables set DB_POSTGRESDB_USER=postgres

railway variables set N8N_HOST=0.0.0.0
railway variables set N8N_PORT=5678
railway variables set N8N_PROTOCOL=https

railway variables set GENERIC_TIMEZONE=America/Sao_Paulo
railway variables set TZ=America/Sao_Paulo

railway variables set EXECUTIONS_DATA_PRUNE=true
railway variables set EXECUTIONS_DATA_MAX_AGE=336

# Gerar chave de encriptação aleatória (32 chars)
ENCRYPTION_KEY=$(openssl rand -hex 16)
railway variables set N8N_ENCRYPTION_KEY="$ENCRYPTION_KEY"

echo "✅ Variables configured!"
echo ""
echo "⚠️  IMPORTANTE: Você precisa adicionar manualmente:"
echo "   1. Referência ao DB_POSTGRESDB_PASSWORD do serviço Postgres"
echo "   2. Gerar um domínio público"
echo "   3. Atualizar WEBHOOK_URL e N8N_EDITOR_BASE_URL com o domínio"
echo ""
echo "📝 No dashboard Railway:"
echo "   - Variables → Add Reference → DB_POSTGRESDB_PASSWORD → Postgres service"
echo "   - Settings → Networking → Generate Domain"
echo "   - Variables → Update WEBHOOK_URL e N8N_EDITOR_BASE_URL"
echo ""

read -p "Pressione ENTER para continuar com o deploy..."

# Deploy usando Docker image
echo "🐳 Deploying from Docker image..."
echo ""
echo "No dashboard Railway:"
echo "  1. Settings → Deploy → Source: Docker Image"
echo "  2. Image: n8nio/n8n:latest"
echo "  3. Deploy!"
echo ""
echo "✅ Script completo! Siga as instruções acima no dashboard."
