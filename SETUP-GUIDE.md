# 🚀 Guia de Configuração e Instalação

Este guia fornece instruções detalhadas para configurar e executar a aplicação de agendamento de estética automotiva.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Software | Versão Mínima | Comando para Verificar |
|----------|---------------|------------------------|
| **Node.js** | 18.17.0+ | `node --version` |
| **npm** | 9.0.0+ | `npm --version` |
| **Git** | 2.0.0+ | `git --version` |

### Instalação dos Pré-requisitos

**Node.js e npm:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (usando Homebrew)
brew install node

# Windows
# Baixe o instalador em https://nodejs.org/
```

---

## 📦 1. Clone do Repositório

```bash
# Clone o projeto
git clone <url-do-repositorio>
cd agenda-estetica-auto

# Verifique a estrutura
ls -la
# Deve ver: backend/ frontend/ REQUIREMENTS.md DESIGN-SYSTEM.md ARCHITECTURE.md API-SPEC.md
```

---

## 🔧 2. Configuração do Backend (NestJS)

### 2.1 Instalação das Dependências

```bash
cd backend
npm install
```

**Dependências principais instaladas:**
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- `@prisma/client`, `@prisma/adapter-libsql`
- `class-validator`, `class-transformer`
- `@libsql/client`

### 2.2 Configuração das Variáveis de Ambiente

Crie o arquivo `.env` na raiz do diretório `backend/`:

```bash
# backend/.env
DATABASE_URL="file:./dev.db"
PORT=3333
NODE_ENV=development

# Fase 2: Autenticação (ainda não implementada)
# JWT_SECRET=sua_chave_secreta_aqui
# JWT_EXPIRES_IN=7d

# Fase 3: Supabase (migração futura)
# SUPABASE_URL=https://seu-projeto.supabase.co
# SUPABASE_ANON_KEY=sua_chave_anonima
# DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

### 2.3 Configuração do Banco de Dados

```bash
# Gera o Prisma Client baseado no schema
npx prisma generate

# Cria o banco de dados SQLite e as tabelas
npx prisma db push

# (Opcional) Popula o banco com dados de exemplo
npx tsx prisma/seed.ts
```

**O que cada comando faz:**
- `prisma generate`: Gera o cliente TypeScript do Prisma
- `prisma db push`: Sincroniza o schema com o banco (cria tabelas)
- `seed.ts`: Insere dados de exemplo (clientes, serviços, veículos)

### 2.4 Verificação da Instalação

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# Deve exibir:
# [Nest] LOG [NestFactory] Starting Nest application...
# [Nest] LOG [InstanceLoader] PrismaModule dependencies initialized
# [Nest] LOG Application is running on: http://localhost:3333
```

**Teste a API:**
```bash
# Em outro terminal
curl http://localhost:3333/api/clientes

# Resposta esperada:
# {
#   "data": [...],
#   "meta": { "total": 5, "page": 1, "limit": 10 }
# }
```

---

## 🎨 3. Configuração do Frontend (Next.js)

### 3.1 Instalação das Dependências

```bash
cd frontend
npm install
```

**Dependências principais instaladas:**
- `next`, `react`, `react-dom`
- `@radix-ui/*` (componentes do shadcn/ui)
- `tailwindcss`, `tailwindcss-animate`
- `lucide-react` (ícones)
- `date-fns` (manipulação de datas)
- `react-hook-form`, `zod` (formulários e validação)

### 3.2 Configuração das Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do diretório `frontend/`:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3333/api
NEXT_PUBLIC_APP_NAME="Agenda Estética Auto"

# Fase 2: Autenticação (ainda não implementada)
# NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3.3 Verificação da Configuração do shadcn/ui

O projeto já deve ter o shadcn/ui configurado. Verifique:

```bash
# Verifique se existe components.json
cat components.json

# Estrutura esperada:
# frontend/
# ├── src/
# │   ├── components/
# │   │   └── ui/        ← Componentes do shadcn/ui
# │   ├── lib/
# │   │   └── utils.ts   ← Função cn() para classes
```

### 3.4 Iniciar o Servidor de Desenvolvimento

```bash
# Certifique-se de que o backend está rodando na porta 3333
npm run dev

# Deve exibir:
# ▲ Next.js 16.1.1 (Turbopack)
# - Local:   http://localhost:3000
# - Network: http://192.168.x.x:3000
# ✓ Ready in 1.2s
```

**Acesse no navegador:**
```
http://localhost:3000
```

---

## ✅ 4. Verificação Completa

### 4.1 Checklist de Verificação

- [ ] Backend rodando em `http://localhost:3333`
- [ ] Frontend rodando em `http://localhost:3000`
- [ ] Banco de dados criado (`backend/prisma/dev.db`)
- [ ] API respondendo: `curl http://localhost:3333/api/clientes`
- [ ] Interface carregando no navegador
- [ ] Console sem erros críticos

### 4.2 Teste End-to-End Manual

1. **Acesse o frontend**: `http://localhost:3000`
2. **Navegue para Clientes**: Clique em "Clientes" no menu
3. **Liste clientes**: Deve exibir a lista (vazia ou com dados do seed)
4. **Crie um cliente**: Clique em "+ Novo Cliente", preencha o formulário
5. **Verifique a criação**: O cliente deve aparecer na lista
6. **Abra o Network tab**: Verifique se as requisições para `localhost:3333` estão funcionando

---

## 🐛 5. Troubleshooting (Problemas Comuns)

### Erro: "Port 3333 already in use"

**Causa:** Outra instância do backend está rodando.

**Solução:**
```bash
# Linux/macOS
lsof -ti:3333 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3333).OwningProcess | Stop-Process -Force
```

### Erro: "Port 3000 already in use"

**Solução:**
```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Ou inicie em outra porta
npm run dev -- -p 3001
```

### Erro: Prisma - "Cannot find module '@prisma/client'"

**Causa:** Prisma Client não foi gerado.

**Solução:**
```bash
cd backend
npx prisma generate
```

### Erro: "Database file not found"

**Causa:** Banco de dados não foi criado.

**Solução:**
```bash
cd backend
npx prisma db push
```

### Erro: CORS no Frontend

**Sintoma:** Erro no console: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa:** Backend não está configurado para aceitar requisições do frontend.

**Solução:** Verifique em `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000'],
  credentials: true,
});
```

### Erro: Next.js - "Cannot find module 'next/dist/compiled/cookie'"

**Causa:** Instalação corrompida ou cache inválido.

**Solução:**
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### Erro: TypeScript - "Cannot find name 'Prisma'"

**Causa:** Types do Prisma não foram gerados.

**Solução:**
```bash
cd backend
npx prisma generate
# Reinicie o editor/IDE
```

### Erro: shadcn/ui - Componente não encontrado

**Sintoma:** `Module not found: Can't resolve '@/components/ui/button'`

**Causa:** Componente não foi instalado.

**Solução:**
```bash
cd frontend
npx shadcn@latest add button
# Ou o componente que estiver faltando
```

### Frontend lento ou travando

**Causa:** Modo de desenvolvimento em produção.

**Solução:**
```bash
# Para desenvolvimento, use:
npm run dev

# Para produção, use:
npm run build
npm start
```

---

## 🔄 6. Workflow de Desenvolvimento

### 6.1 Fluxo de Trabalho Recomendado

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Comandos adicionais (Prisma, git, etc.)
cd backend
npx prisma studio  # Abre interface visual do banco
```

### 6.2 Comandos Úteis

**Backend:**
```bash
# Desenvolvimento
npm run dev               # Inicia com hot-reload (nodemon)
npm run start:dev         # Alternativo

# Produção
npm run build            # Compila TypeScript
npm run start:prod       # Executa build

# Prisma
npx prisma studio        # Interface visual do banco
npx prisma migrate dev   # Cria migration (para produção)
npx prisma db push       # Sync rápido (desenvolvimento)
npx prisma generate      # Regenera o client

# Testes
npm run test             # Executa testes unitários
npm run test:e2e         # Executa testes E2E
```

**Frontend:**
```bash
# Desenvolvimento
npm run dev              # Inicia com Turbopack
npm run dev -- -p 3001   # Porta customizada

# Produção
npm run build            # Build otimizado
npm start                # Serve build de produção

# Qualidade de código
npm run lint             # ESLint
npm run type-check       # TypeScript check

# shadcn/ui
npx shadcn@latest add [component]  # Adiciona componente
npx shadcn@latest diff [component] # Verifica atualizações
```

### 6.3 Estrutura de Branches (Recomendada)

```
main          ← Produção estável
├── develop   ← Branch de desenvolvimento
    ├── feature/nome-da-feature
    ├── fix/nome-do-bug
    └── refactor/nome-da-refatoracao
```

**Workflow:**
```bash
# Criar feature
git checkout develop
git checkout -b feature/adicionar-notificacoes

# Trabalhar na feature...

# Merge para develop
git checkout develop
git merge feature/adicionar-notificacoes

# Deploy para produção
git checkout main
git merge develop
```

---

## 🗄️ 7. Gerenciamento do Banco de Dados

### 7.1 Prisma Studio (Interface Visual)

```bash
cd backend
npx prisma studio

# Abre em: http://localhost:5555
```

**Funcionalidades:**
- Visualizar todas as tabelas
- Criar/editar/deletar registros
- Executar queries visuais
- Ver relações entre tabelas

### 7.2 Resetar o Banco de Dados

```bash
# CUIDADO: Apaga todos os dados!
cd backend
rm prisma/dev.db
npx prisma db push
npx tsx prisma/seed.ts
```

### 7.3 Backup do Banco de Dados

```bash
# SQLite (desenvolvimento)
cp backend/prisma/dev.db backend/prisma/dev.db.backup

# Restaurar
cp backend/prisma/dev.db.backup backend/prisma/dev.db
```

---

## 🚀 8. Deploy (Fase Futura)

### 8.1 Preparação para Produção

**Backend (NestJS):**
- Mudar `DATABASE_URL` para PostgreSQL (Supabase)
- Configurar variáveis de ambiente no serviço de hosting
- Executar `npx prisma migrate deploy`
- Build: `npm run build`

**Frontend (Next.js):**
- Atualizar `NEXT_PUBLIC_API_URL` para URL de produção
- Build: `npm run build`
- Deploy na Vercel (recomendado para Next.js)

### 8.2 Plataformas Recomendadas

| Componente | Plataforma | Observações |
|------------|-----------|-------------|
| **Backend** | Railway, Render, Fly.io | Suporte a Node.js e bancos de dados |
| **Frontend** | Vercel, Netlify | Otimizado para Next.js |
| **Banco de Dados** | Supabase (PostgreSQL) | Conforme REQUIREMENTS.md |
| **Storage** | Supabase Storage, S3 | Para fotos de veículos (futuro) |

---

## 📚 9. Próximos Passos

Após a configuração inicial:

1. **Explore a documentação:**
   - [REQUIREMENTS.md](./REQUIREMENTS.md) - Funcionalidades e roadmap
   - [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) - Sistema de design e componentes
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura técnica detalhada
   - [API-SPEC.md](./API-SPEC.md) - Especificação completa da API

2. **Desenvolva as funcionalidades da Fase 1:**
   - CRUD de Clientes
   - CRUD de Veículos
   - CRUD de Serviços
   - Sistema de Agendamentos

3. **Implemente Fase 2 (Autenticação):**
   - Integração Supabase Auth
   - Guards no NestJS
   - Middleware de autenticação no Next.js

4. **Implemente Fase 3 (Notificações):**
   - WhatsApp Business API
   - Sistema de lembretes

5. **Implemente Fase 4 (IA):**
   - Integração OpenAI/Claude
   - Agendamento via WhatsApp

---

## 🆘 10. Suporte e Recursos

### Documentação Oficial

- **Next.js**: https://nextjs.org/docs
- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

### Comandos de Diagnóstico

```bash
# Versões instaladas
node --version
npm --version

# Informações do projeto
cd backend && npm list --depth=0
cd frontend && npm list --depth=0

# Logs detalhados
cd backend && npm run dev -- --debug
cd frontend && npm run dev -- --turbo
```

---

## ✨ Conclusão

Você agora tem um ambiente de desenvolvimento completamente configurado para trabalhar na aplicação de agendamento de estética automotiva.

**Status das Funcionalidades:**
- ✅ Estrutura do projeto criada
- ✅ Banco de dados configurado (SQLite)
- ✅ Backend NestJS funcionando
- ✅ Frontend Next.js funcionando
- ⏳ Funcionalidades sendo implementadas
- ⏳ Integração Supabase (Fase 2)
- ⏳ Sistema de notificações (Fase 3)
- ⏳ IA para WhatsApp (Fase 4)

**Em caso de dúvidas ou problemas:**
1. Consulte a seção de Troubleshooting acima
2. Verifique os logs no terminal
3. Revise os arquivos de documentação do projeto

Bom desenvolvimento! 🚀
