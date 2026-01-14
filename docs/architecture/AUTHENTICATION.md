# Sistema de Autenticação

Sistema completo de autenticação JWT com proteção de rotas e gerenciamento de sessão.

---

## 📋 Visão Geral

### Stack:
- **Backend:** NestJS + Passport JWT
- **Frontend:** Next.js 15 + Client-side guards
- **Storage:** localStorage (JWT token + user data)
- **Security:** JWT Bearer tokens, auto-refresh em 401

### Fluxo:
```
1. Usuário faz login → Backend valida credenciais
2. Backend retorna JWT token + user data
3. Frontend armazena em localStorage
4. AuthGuard protege rotas client-side
5. Todas as requisições incluem Bearer token
6. Em 401: auto-logout + redirect para /login
```

---

## 🔐 Componentes

### 1. Backend (`backend/src/auth`)

#### AuthModule
- JWT Strategy (Passport)
- Login endpoint: `POST /api/auth/login`
- Validação de credenciais

#### Resposta de Login
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@demo.com",
    "nome": "Admin",
    "role": "ADMIN",
    "tenant": {
      "id": "uuid",
      "nome": "Demo Estética",
      "slug": "demo",
      "plano": "FREE"
    }
  }
}
```

---

### 2. Frontend Auth Service (`frontend/lib/auth.ts`)

#### Funções Principais

**login(email, senha)**
```typescript
await auth.login('admin@demo.com', 'admin123');
// Armazena token + user em localStorage
// Auto-redirect feito pelo componente de login
```

**logout()**
```typescript
auth.logout();
// Remove token + user de localStorage
// Redirect manual para /login necessário
```

**isAuthenticated()**
```typescript
const isAuth = auth.isAuthenticated();
// Retorna: boolean (verifica se token existe)
```

**getToken()**
```typescript
const token = auth.getToken();
// Retorna: string | null
```

**getUser()**
```typescript
const user = auth.getUser();
// Retorna: User | null
// Parse automático do JSON armazenado
```

**getAuthHeader()**
```typescript
const headers = auth.getAuthHeader();
// Retorna: { Authorization: 'Bearer token' } ou {}
```

#### Storage Keys
- `auth_token` - JWT token
- `auth_user` - User data (JSON stringified)

---

### 3. AuthGuard Component (`frontend/components/auth-guard.tsx`)

Componente de proteção de rotas **client-side**.

#### Features:
- ✅ Verifica autenticação em `useEffect`
- ✅ Redireciona não-autenticados para `/login`
- ✅ Redireciona autenticados de `/login` para `/`
- ✅ Mostra loading state durante verificação
- ✅ Executa em toda mudança de rota

#### Uso:
```tsx
// app/layout.tsx (já configurado)
import { AuthGuard } from "@/components/auth-guard";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
```

#### Loading State:
```tsx
// Exibido durante auth check
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
    {/* Logo animado */}
    <Calendar className="w-8 h-8 text-white" />
    {/* Spinner */}
    <div className="animate-spin h-10 w-10 border-b-2 border-blue-600"></div>
    <p>Verificando autenticação...</p>
  </div>
</div>
```

---

### 4. API Client (`frontend/lib/api.ts`)

Wrapper de `fetch` com autenticação automática.

#### Features:
- ✅ Adiciona `Authorization: Bearer {token}` em todas requisições
- ✅ Detecta 401 e faz auto-logout
- ✅ Redireciona para `/login` em sessão expirada
- ✅ Usa `NEXT_PUBLIC_API_URL` (dinâmico)

#### Exemplo de Uso:
```typescript
import { clientesAPI } from '@/lib/api';

// GET request (token automático)
const clientes = await clientesAPI.getAll();

// POST request (token automático)
const novoCliente = await clientesAPI.create({
  nome: 'João Silva',
  telefone: '11999999999',
  // ...
});

// Em caso de 401:
// 1. auth.logout() é chamado
// 2. Redirect para /login
// 3. Throw error "Sessão expirada"
```

#### Auto-logout em 401:
```typescript
// lib/api.ts
if (res.status === 401 && typeof window !== 'undefined') {
  auth.logout();
  window.location.href = '/login';
  throw new Error('Sessão expirada. Faça login novamente.');
}
```

---

### 5. Login Page (`frontend/app/(auth)/login/page.tsx`)

Página de login com design limpo seguindo o Design System.

#### Features:
- ✅ Form validation (email required, senha required)
- ✅ Error handling com mensagem visual
- ✅ Loading state durante login
- ✅ Auto-redirect para `/` após sucesso
- ✅ Credenciais de teste visíveis

#### Fluxo:
```
1. Usuário preenche email + senha
2. Submit → setLoading(true)
3. await auth.login(email, senha)
   - Sucesso: router.push('/') → AuthGuard detecta auth → mostra dashboard
   - Erro: setError(message) → exibe mensagem vermelha
4. setLoading(false)
```

---

### 6. UserMenu Component (`frontend/components/user-menu.tsx`)

Menu de usuário no header com logout.

#### Features:
- ✅ Mostra nome + tenant do usuário
- ✅ Avatar com iniciais (azul)
- ✅ Botão de logout com ícone
- ✅ Responsive (hide info em mobile)

#### Uso:
```tsx
// Já usado em app/page.tsx
<UserMenu />
```

---

## 🔄 Fluxo Completo

### Login Flow:
```
1. User acessa http://localhost:3000
   → AuthGuard verifica auth → FALSE
   → Redirect para /login

2. User preenche form + submit
   → POST /api/auth/login
   → Backend valida → retorna JWT + user

3. Frontend armazena localStorage:
   - auth_token: "eyJhbGc..."
   - auth_user: "{\"id\":\"...\",\"nome\":...}"

4. router.push('/') → AuthGuard detecta token
   → setIsChecking(false) → mostra dashboard

5. User navega pela app:
   → Todas requests incluem Bearer token
   → AuthGuard valida em toda mudança de rota
```

### Logout Flow:
```
1. User clica "Sair" no UserMenu
   → auth.logout()
   → Remove auth_token + auth_user

2. router.push('/login')
   → AuthGuard verifica auth → FALSE
   → Permite acesso a /login
```

### Session Expiration Flow:
```
1. User faz request → API retorna 401
   → lib/api.ts detecta 401

2. auth.logout() + window.location.href = '/login'
   → Remove localStorage
   → Hard redirect (perde state)

3. Usuário vê página de login
   → Pode fazer login novamente
```

---

## 🛡️ Security Features

### Current:
- ✅ JWT tokens (stateless)
- ✅ Bearer authentication
- ✅ Auto-logout em 401
- ✅ Protected routes (AuthGuard)
- ✅ localStorage isolation (per domain)
- ✅ HTTPS ready (produção)

### Future Improvements:
- [ ] Migrar para **httpOnly cookies** (mais seguro)
- [ ] Implementar **refresh tokens**
- [ ] Adicionar **rate limiting** no login
- [ ] Implementar **2FA** (opcional)
- [ ] Adicionar **CSRF protection**
- [ ] Log de tentativas de login

---

## 📝 Configuração

### Variáveis de Ambiente

**Backend (`.env`)**
```bash
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

**Frontend (`.env`)**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

### Produção (Railway/Vercel)

**Backend:**
- Gerar JWT_SECRET forte: `openssl rand -base64 32`
- Ajustar JWT_EXPIRES_IN conforme necessidade

**Frontend:**
- Setar NEXT_PUBLIC_API_URL para URL do backend em produção
- Ex: `https://backend-production-xxxx.railway.app`

---

## 🐛 Troubleshooting

### "Sessão expirada" constantemente
- Verificar JWT_EXPIRES_IN no backend
- Verificar se token está sendo armazenado: `localStorage.getItem('auth_token')`
- Verificar console por erros de CORS

### Login não funciona
1. Backend rodando? `curl http://localhost:3333/api/auth/login`
2. CORS configurado? Verificar backend `app.enableCors()`
3. Credenciais corretas? `admin@demo.com / admin123`
4. Verificar Network tab do DevTools

### AuthGuard não redireciona
- Verificar se `<AuthGuard>` está no `app/layout.tsx`
- Verificar console por erros
- Verificar se `auth.isAuthenticated()` retorna correto

### Token não é enviado nas requisições
- Verificar `auth.getAuthHeader()` retorna Bearer token
- Verificar `fetchAPI()` em `lib/api.ts` inclui header
- Verificar Network tab se Authorization header presente

---

## 📚 Referências

- NestJS Auth: https://docs.nestjs.com/security/authentication
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- Next.js Auth: https://nextjs.org/docs/app/building-your-application/authentication
- OWASP Auth Cheatsheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

---

## ✅ Checklist de Implementação

- [x] Backend: JWT Strategy configurado
- [x] Backend: Login endpoint funcionando
- [x] Frontend: lib/auth.ts com localStorage
- [x] Frontend: Login page com form
- [x] Frontend: AuthGuard protegendo rotas
- [x] Frontend: API client com auto-logout
- [x] Frontend: UserMenu com logout
- [x] Frontend: Variáveis de ambiente dinâmicas
- [x] Documentação: Fluxo completo
- [ ] Testes: E2E de login/logout
- [ ] Produção: Deploy com JWT_SECRET forte

---

**Última atualização:** 2026-01-14
