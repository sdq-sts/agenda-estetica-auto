# 🐳 Setup Local com Docker

Guia para rodar o projeto localmente com Docker Compose.

---

## 📋 Pré-requisitos

- Docker instalado ([instalar](https://docs.docker.com/get-docker/))
- Docker Compose instalado (geralmente vem com Docker Desktop)
- Git

---

## 🚀 Quick Start (5 minutos)

### 1. Clonar repositório

```bash
git clone <seu-repo>
cd agenda-estetica-auto
```

### 2. Configurar variáveis de ambiente

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Subir todos os serviços

```bash
docker-compose up -d
```

Isso vai subir:
- PostgreSQL (porta 5432)
- Backend NestJS (porta 3333)
- Evolution API (porta 8080)
- Frontend Next.js (porta 3000)

### 4. Aguardar serviços iniciarem (~30 segundos)

```bash
# Verificar logs
docker-compose logs -f

# Quando aparecer:
# ✓ Ready in 1779ms (frontend)
# Application is running on port 3333 (backend)
# Evolution API is ready (evolution)
```

### 5. Rodar migrations e seed

```bash
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npm run seed
```

### 6. Conectar WhatsApp

1. Abrir http://localhost:8080/instance/connect/agenda-estetica
2. Usar Postman/Insomnia ou curl:

```bash
curl -X GET http://localhost:8080/instance/connect/agenda-estetica \
  -H "apikey: evolution-dev-key-123"
```

3. Escanear QR Code com WhatsApp
4. ✅ Conectado!

### 7. Acessar aplicação

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3333
- **Evolution API:** http://localhost:8080
- **PostgreSQL:** localhost:5432

**Login:** admin@demo.com / admin123

---

## 🛠️ Comandos Úteis

### Gerenciar containers

```bash
# Subir tudo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Parar tudo
docker-compose down

# Parar e remover volumes (⚠️ apaga banco!)
docker-compose down -v

# Rebuild de um serviço
docker-compose up -d --build backend
```

### Backend

```bash
# Entrar no container
docker-compose exec backend sh

# Rodar migrations
docker-compose exec backend npx prisma migrate dev

# Gerar Prisma Client
docker-compose exec backend npx prisma generate

# Ver logs do Prisma
docker-compose exec backend npx prisma studio

# Rodar seed
docker-compose exec backend npm run seed

# Rodar testes
docker-compose exec backend npm test
```

### Evolution API

```bash
# Ver status da instância
curl http://localhost:8080/instance/connectionState/agenda-estetica \
  -H "apikey: evolution-dev-key-123"

# Enviar mensagem de teste
curl -X POST http://localhost:8080/message/sendText/agenda-estetica \
  -H "apikey: evolution-dev-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Teste de mensagem!"
  }'

# Ver logs
docker-compose logs -f evolution
```

### PostgreSQL

```bash
# Conectar no banco
docker-compose exec postgres psql -U postgres -d agenda_estetica

# Backup
docker-compose exec postgres pg_dump -U postgres agenda_estetica > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres agenda_estetica < backup.sql
```

---

## 🐛 Troubleshooting

### Erro: "port already in use"

Outro serviço está usando a porta. Opções:

**Opção 1:** Parar o serviço conflitante
```bash
# Ver quem está usando a porta
lsof -i :3333
kill <PID>
```

**Opção 2:** Mudar porta no docker-compose.yml
```yaml
backend:
  ports:
    - "3334:3333"  # Host:Container
```

### Erro: Backend não conecta no PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Ver logs
docker-compose logs postgres

# Recriar container
docker-compose down
docker-compose up -d postgres
```

### Erro: Evolution não inicia

```bash
# Ver logs
docker-compose logs evolution

# Recriar volume
docker-compose down -v
docker-compose up -d
```

### Erro: WhatsApp desconecta

```bash
# Reconectar
curl -X GET http://localhost:8080/instance/connect/agenda-estetica \
  -H "apikey: evolution-dev-key-123"

# Escanear QR Code novamente
```

### Erro: npm install falha no container

```bash
# Limpar cache e rebuild
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

---

## 🔧 Desenvolvimento

### Hot Reload

O docker-compose está configurado com volumes para hot reload:

```yaml
volumes:
  - ./backend:/app          # Código sincronizado
  - /app/node_modules       # node_modules isolado
```

**Mudanças são refletidas automaticamente!**

### Instalar nova dependência

```bash
# Backend
docker-compose exec backend npm install <package>

# Rebuild (se necessário)
docker-compose up -d --build backend
```

### Debug

Adicionar no docker-compose.yml:

```yaml
backend:
  # ... outras configs
  command: npm run start:debug
  ports:
    - "3333:3333"
    - "9229:9229"  # Debug port
```

Conectar debugger no VSCode (port 9229).

---

## 📊 Monitoramento

### Ver uso de recursos

```bash
docker stats
```

### Ver containers rodando

```bash
docker-compose ps
```

### Limpar recursos não usados

```bash
# Remover containers parados
docker container prune

# Remover imagens não usadas
docker image prune

# Limpar tudo (⚠️ cuidado!)
docker system prune -a
```

---

## 🚀 Próximos Passos

1. ✅ Projeto rodando local
2. [ ] Testar envio de WhatsApp
3. [ ] Deploy no Railway (ver docs/RAILWAY-DEPLOY.md)
4. [ ] Conectar WhatsApp em produção
5. [ ] Treinar cliente

---

## 🆘 Ajuda

**Problemas?**
1. Ver logs: `docker-compose logs -f`
2. Verificar .env: `cat backend/.env`
3. Recriar tudo: `docker-compose down -v && docker-compose up -d`

**Documentação:**
- Docker Compose: https://docs.docker.com/compose/
- Evolution API: https://doc.evolution-api.com
- NestJS: https://docs.nestjs.com
