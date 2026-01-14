# 🌐 API Specification - Agendamento Estética Automotiva

## 📋 Índice
1. [Informações Gerais](#informações-gerais)
2. [Autenticação](#autenticação)
3. [Clientes API](#clientes-api)
4. [Veículos API](#veículos-api)
5. [Serviços API](#serviços-api)
6. [Agendamentos API](#agendamentos-api)
7. [Notificações API](#notificações-api)
8. [Webhooks API](#webhooks-api)
9. [Códigos de Status](#códigos-de-status)
10. [Error Handling](#error-handling)

---

## 📡 Informações Gerais

### Base URL

```
Desenvolvimento: http://localhost:3333
Produção: https://api.agendaestetica.com (futuro)
```

### Headers Padrão

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  # Fase 2 - Autenticação
```

### Formato de Resposta Padrão

**Sucesso:**
```json
{
  "data": { /* dados solicitados */ },
  "meta": { /* metadados, paginação */ }
}
```

**Erro:**
```json
{
  "statusCode": 400,
  "message": "Mensagem de erro descritiva",
  "error": "Bad Request",
  "timestamp": "2026-01-12T10:30:00.000Z",
  "path": "/api/clientes"
}
```

### Paginação

Endpoints que retornam listas suportam paginação:

```http
GET /api/clientes?page=1&limit=10
```

**Resposta com paginação:**
```json
{
  "data": [...],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 🔐 Autenticação

> **Nota**: Fase 2 - Supabase Auth
> Por enquanto, todas as rotas são públicas

### POST /auth/login

Autentica usuário e retorna token JWT.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@estetica.com",
  "password": "senha123"
}
```

**Response 200 OK:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "usr_123",
    "email": "admin@estetica.com",
    "nome": "Admin",
    "role": "admin"
  }
}
```

**Response 401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas",
  "error": "Unauthorized"
}
```

### POST /auth/register

Registra novo usuário.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123",
  "nome": "João Silva"
}
```

**Response 201 Created:**
```json
{
  "id": "usr_456",
  "email": "usuario@example.com",
  "nome": "João Silva",
  "role": "user",
  "createdAt": "2026-01-12T10:30:00.000Z"
}
```

---

## 👥 Clientes API

### GET /api/clientes

Lista todos os clientes com paginação.

**Request:**
```http
GET /api/clientes?page=1&limit=10
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| page | number | Não | Página (default: 1) |
| limit | number | Não | Itens por página (default: 10, max: 100) |

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "clt_123abc",
      "nome": "João Silva",
      "telefone": "11999999999",
      "whatsapp": "11999999999",
      "email": "joao@example.com",
      "cpfCnpj": "123.456.789-00",
      "observacoes": "Cliente VIP",
      "createdAt": "2026-01-10T10:00:00.000Z",
      "updatedAt": "2026-01-10T10:00:00.000Z",
      "veiculos": [
        {
          "id": "vec_456def",
          "marca": "Toyota",
          "modelo": "Corolla",
          "ano": 2023,
          "placa": "ABC1234",
          "cor": "Prata"
        }
      ],
      "_count": {
        "agendamentos": 5
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### GET /api/clientes/:id

Busca cliente por ID com todos os relacionamentos.

**Request:**
```http
GET /api/clientes/clt_123abc
```

**Response 200 OK:**
```json
{
  "id": "clt_123abc",
  "nome": "João Silva",
  "telefone": "11999999999",
  "whatsapp": "11999999999",
  "email": "joao@example.com",
  "cpfCnpj": "123.456.789-00",
  "observacoes": "Cliente VIP",
  "createdAt": "2026-01-10T10:00:00.000Z",
  "updatedAt": "2026-01-10T10:00:00.000Z",
  "veiculos": [
    {
      "id": "vec_456def",
      "marca": "Toyota",
      "modelo": "Corolla",
      "ano": 2023,
      "placa": "ABC1234",
      "cor": "Prata",
      "createdAt": "2026-01-10T10:30:00.000Z",
      "updatedAt": "2026-01-10T10:30:00.000Z"
    }
  ],
  "agendamentos": [
    {
      "id": "agd_789ghi",
      "dataHora": "2026-01-15T14:00:00.000Z",
      "status": "CONFIRMADO",
      "valorTotal": 400.00,
      "servicos": [
        {
          "servico": {
            "id": "srv_111",
            "nome": "Lavagem Completa"
          },
          "preco": 100.00
        }
      ]
    }
  ]
}
```

**Response 404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Cliente com ID clt_123abc não encontrado",
  "error": "Not Found"
}
```

### GET /api/clientes/search

Busca clientes por nome, telefone ou placa de veículo.

**Request:**
```http
GET /api/clientes/search?q=joao
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| q | string | Sim | Termo de busca (min 2 caracteres) |

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "clt_123abc",
      "nome": "João Silva",
      "telefone": "11999999999",
      "email": "joao@example.com",
      "veiculos": [...]
    }
  ]
}
```

### POST /api/clientes

Cria novo cliente.

**Request:**
```http
POST /api/clientes
Content-Type: application/json

{
  "nome": "Maria Santos",
  "telefone": "11988888888",
  "whatsapp": "11988888888",
  "email": "maria@example.com",
  "cpfCnpj": "987.654.321-00",
  "observacoes": "Preferência por atendimento matutino"
}
```

**Validações:**
| Campo | Regras |
|-------|--------|
| nome | string, min: 3, max: 100, obrigatório |
| telefone | string, formato: 10-11 dígitos, único, obrigatório |
| whatsapp | string, formato: 10-11 dígitos, opcional |
| email | string, formato email válido, único, opcional |
| cpfCnpj | string, opcional |
| observacoes | string, max: 500, opcional |

**Response 201 Created:**
```json
{
  "id": "clt_456new",
  "nome": "Maria Santos",
  "telefone": "11988888888",
  "whatsapp": "11988888888",
  "email": "maria@example.com",
  "cpfCnpj": "987.654.321-00",
  "observacoes": "Preferência por atendimento matutino",
  "createdAt": "2026-01-12T11:00:00.000Z",
  "updatedAt": "2026-01-12T11:00:00.000Z"
}
```

**Response 400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": [
    "nome deve ter no mínimo 3 caracteres",
    "telefone deve ter formato válido"
  ],
  "error": "Bad Request"
}
```

**Response 409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "Telefone já cadastrado",
  "error": "Conflict"
}
```

### PATCH /api/clientes/:id

Atualiza dados do cliente (parcial).

**Request:**
```http
PATCH /api/clientes/clt_123abc
Content-Type: application/json

{
  "email": "novoemail@example.com",
  "observacoes": "Atualização de observações"
}
```

**Response 200 OK:**
```json
{
  "id": "clt_123abc",
  "nome": "João Silva",
  "telefone": "11999999999",
  "whatsapp": "11999999999",
  "email": "novoemail@example.com",
  "cpfCnpj": "123.456.789-00",
  "observacoes": "Atualização de observações",
  "createdAt": "2026-01-10T10:00:00.000Z",
  "updatedAt": "2026-01-12T11:30:00.000Z"
}
```

### DELETE /api/clientes/:id

Remove cliente (soft delete ou cascade delete).

**Request:**
```http
DELETE /api/clientes/clt_123abc
```

**Response 204 No Content:**
```
(sem body)
```

**Response 404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Cliente com ID clt_123abc não encontrado",
  "error": "Not Found"
}
```

**Response 400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Não é possível deletar cliente com agendamentos ativos",
  "error": "Bad Request"
}
```

---

## 🚗 Veículos API

### GET /api/veiculos

Lista todos os veículos ou filtra por cliente.

**Request:**
```http
GET /api/veiculos?clienteId=clt_123abc
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| clienteId | string | Não | Filtrar por cliente |
| page | number | Não | Página |
| limit | number | Não | Itens por página |

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "vec_456def",
      "marca": "Toyota",
      "modelo": "Corolla",
      "ano": 2023,
      "placa": "ABC1234",
      "cor": "Prata",
      "clienteId": "clt_123abc",
      "cliente": {
        "id": "clt_123abc",
        "nome": "João Silva",
        "telefone": "11999999999"
      },
      "createdAt": "2026-01-10T10:30:00.000Z",
      "updatedAt": "2026-01-10T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### GET /api/veiculos/:id

Busca veículo por ID.

**Request:**
```http
GET /api/veiculos/vec_456def
```

**Response 200 OK:**
```json
{
  "id": "vec_456def",
  "marca": "Toyota",
  "modelo": "Corolla",
  "ano": 2023,
  "placa": "ABC1234",
  "cor": "Prata",
  "clienteId": "clt_123abc",
  "cliente": {
    "id": "clt_123abc",
    "nome": "João Silva",
    "telefone": "11999999999",
    "email": "joao@example.com"
  },
  "agendamentos": [
    {
      "id": "agd_789ghi",
      "dataHora": "2026-01-15T14:00:00.000Z",
      "status": "CONFIRMADO"
    }
  ],
  "createdAt": "2026-01-10T10:30:00.000Z",
  "updatedAt": "2026-01-10T10:30:00.000Z"
}
```

### POST /api/veiculos

Cria novo veículo.

**Request:**
```http
POST /api/veiculos
Content-Type: application/json

{
  "marca": "Honda",
  "modelo": "Civic",
  "ano": 2024,
  "placa": "XYZ5678",
  "cor": "Preto",
  "clienteId": "clt_123abc"
}
```

**Validações:**
| Campo | Regras |
|-------|--------|
| marca | string, min: 2, max: 50, obrigatório |
| modelo | string, min: 1, max: 50, obrigatório |
| ano | number, min: 1900, max: ano atual + 1, obrigatório |
| placa | string, min: 7, único, obrigatório |
| cor | string, max: 30, opcional |
| clienteId | string, deve existir, obrigatório |

**Response 201 Created:**
```json
{
  "id": "vec_789new",
  "marca": "Honda",
  "modelo": "Civic",
  "ano": 2024,
  "placa": "XYZ5678",
  "cor": "Preto",
  "clienteId": "clt_123abc",
  "cliente": {
    "id": "clt_123abc",
    "nome": "João Silva"
  },
  "createdAt": "2026-01-12T12:00:00.000Z",
  "updatedAt": "2026-01-12T12:00:00.000Z"
}
```

**Response 409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "Placa já cadastrada",
  "error": "Conflict"
}
```

### PATCH /api/veiculos/:id

Atualiza veículo.

**Request:**
```http
PATCH /api/veiculos/vec_456def
Content-Type: application/json

{
  "cor": "Azul Escuro"
}
```

**Response 200 OK:**
```json
{
  "id": "vec_456def",
  "marca": "Toyota",
  "modelo": "Corolla",
  "ano": 2023,
  "placa": "ABC1234",
  "cor": "Azul Escuro",
  "clienteId": "clt_123abc",
  "updatedAt": "2026-01-12T12:30:00.000Z"
}
```

### DELETE /api/veiculos/:id

Remove veículo.

**Request:**
```http
DELETE /api/veiculos/vec_456def
```

**Response 204 No Content**

---

## 🔧 Serviços API

### GET /api/servicos

Lista todos os serviços com filtros opcionais.

**Request:**
```http
GET /api/servicos?ativo=true&categoria=Lavagem
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| ativo | boolean | Não | Filtrar por ativo/inativo |
| categoria | string | Não | Filtrar por categoria |
| page | number | Não | Página |
| limit | number | Não | Itens por página |

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "srv_111aaa",
      "nome": "Lavagem Simples",
      "descricao": "Lavagem externa completa do veículo",
      "categoria": "Lavagem",
      "duracaoMinutos": 30,
      "preco": 50.00,
      "ativo": true,
      "imagemUrl": "https://cdn.example.com/lavagem-simples.jpg",
      "observacoes": null,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "srv_222bbb",
      "nome": "Lavagem Completa",
      "descricao": "Lavagem externa e interna completa",
      "categoria": "Lavagem",
      "duracaoMinutos": 60,
      "preco": 100.00,
      "ativo": true,
      "imagemUrl": "https://cdn.example.com/lavagem-completa.jpg",
      "observacoes": null,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### GET /api/servicos/:id

Busca serviço por ID.

**Request:**
```http
GET /api/servicos/srv_111aaa
```

**Response 200 OK:**
```json
{
  "id": "srv_111aaa",
  "nome": "Lavagem Simples",
  "descricao": "Lavagem externa completa do veículo",
  "categoria": "Lavagem",
  "duracaoMinutos": 30,
  "preco": 50.00,
  "ativo": true,
  "imagemUrl": "https://cdn.example.com/lavagem-simples.jpg",
  "observacoes": null,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

### POST /api/servicos

Cria novo serviço.

**Request:**
```http
POST /api/servicos
Content-Type: application/json

{
  "nome": "Polimento Técnico",
  "descricao": "Polimento profissional com cera de alta qualidade",
  "categoria": "Polimento",
  "duracaoMinutos": 120,
  "preco": 300.00,
  "ativo": true,
  "imagemUrl": "https://cdn.example.com/polimento.jpg",
  "observacoes": "Requer agendamento com 1 dia de antecedência"
}
```

**Validações:**
| Campo | Regras |
|-------|--------|
| nome | string, min: 3, max: 100, obrigatório |
| descricao | string, max: 500, opcional |
| categoria | string, min: 3, max: 50, obrigatório |
| duracaoMinutos | number, min: 1, obrigatório |
| preco | number, min: 0, obrigatório |
| ativo | boolean, default: true, opcional |
| imagemUrl | string, URL válida, opcional |
| observacoes | string, max: 500, opcional |

**Response 201 Created:**
```json
{
  "id": "srv_333ccc",
  "nome": "Polimento Técnico",
  "descricao": "Polimento profissional com cera de alta qualidade",
  "categoria": "Polimento",
  "duracaoMinutos": 120,
  "preco": 300.00,
  "ativo": true,
  "imagemUrl": "https://cdn.example.com/polimento.jpg",
  "observacoes": "Requer agendamento com 1 dia de antecedência",
  "createdAt": "2026-01-12T13:00:00.000Z",
  "updatedAt": "2026-01-12T13:00:00.000Z"
}
```

### PATCH /api/servicos/:id

Atualiza serviço.

**Request:**
```http
PATCH /api/servicos/srv_111aaa
Content-Type: application/json

{
  "preco": 55.00,
  "ativo": true
}
```

**Response 200 OK:**
```json
{
  "id": "srv_111aaa",
  "nome": "Lavagem Simples",
  "preco": 55.00,
  "ativo": true,
  "updatedAt": "2026-01-12T13:30:00.000Z"
}
```

### DELETE /api/servicos/:id

Desativa serviço (soft delete - marca como inativo).

**Request:**
```http
DELETE /api/servicos/srv_111aaa
```

**Response 204 No Content**

---

## 📅 Agendamentos API

### GET /api/agendamentos

Lista agendamentos com filtros.

**Request:**
```http
GET /api/agendamentos?status=CONFIRMADO&dataInicio=2026-01-15T00:00:00.000Z&dataFim=2026-01-20T23:59:59.999Z
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| status | string | Não | PENDENTE, CONFIRMADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO |
| clienteId | string | Não | Filtrar por cliente |
| dataInicio | ISO 8601 | Não | Data/hora inicial |
| dataFim | ISO 8601 | Não | Data/hora final |
| page | number | Não | Página |
| limit | number | Não | Itens por página |

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "agd_789ghi",
      "dataHora": "2026-01-15T14:00:00.000Z",
      "status": "CONFIRMADO",
      "clienteId": "clt_123abc",
      "veiculoId": "vec_456def",
      "observacoes": "Cliente pediu atenção especial aos bancos",
      "valorTotal": 400.00,
      "createdAt": "2026-01-10T15:00:00.000Z",
      "updatedAt": "2026-01-10T15:00:00.000Z",
      "cliente": {
        "id": "clt_123abc",
        "nome": "João Silva",
        "telefone": "11999999999"
      },
      "veiculo": {
        "id": "vec_456def",
        "marca": "Toyota",
        "modelo": "Corolla",
        "placa": "ABC1234"
      },
      "servicos": [
        {
          "id": "ags_001",
          "servicoId": "srv_222bbb",
          "preco": 100.00,
          "servico": {
            "id": "srv_222bbb",
            "nome": "Lavagem Completa",
            "duracaoMinutos": 60
          }
        },
        {
          "id": "ags_002",
          "servicoId": "srv_333ccc",
          "preco": 300.00,
          "servico": {
            "id": "srv_333ccc",
            "nome": "Polimento Técnico",
            "duracaoMinutos": 120
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### GET /api/agendamentos/disponiveis

Busca horários disponíveis para uma data específica.

**Request:**
```http
GET /api/agendamentos/disponiveis?data=2026-01-15
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| data | ISO 8601 date | Sim | Data para buscar horários (YYYY-MM-DD) |

**Response 200 OK:**
```json
{
  "data": [
    "2026-01-15T08:00:00.000Z",
    "2026-01-15T08:30:00.000Z",
    "2026-01-15T09:00:00.000Z",
    "2026-01-15T09:30:00.000Z",
    "2026-01-15T10:00:00.000Z",
    "2026-01-15T10:30:00.000Z",
    "2026-01-15T11:00:00.000Z",
    "2026-01-15T11:30:00.000Z",
    "2026-01-15T15:00:00.000Z",
    "2026-01-15T15:30:00.000Z",
    "2026-01-15T16:00:00.000Z",
    "2026-01-15T16:30:00.000Z",
    "2026-01-15T17:00:00.000Z",
    "2026-01-15T17:30:00.000Z"
  ]
}
```

**Lógica:**
- Horário de funcionamento: 8h - 18h
- Intervalos de 30 minutos
- Remove horários que já passaram
- Remove horários com conflito (agendamento existente)
- Considera duração total dos serviços

### GET /api/agendamentos/:id

Busca agendamento por ID.

**Request:**
```http
GET /api/agendamentos/agd_789ghi
```

**Response 200 OK:**
```json
{
  "id": "agd_789ghi",
  "dataHora": "2026-01-15T14:00:00.000Z",
  "status": "CONFIRMADO",
  "clienteId": "clt_123abc",
  "veiculoId": "vec_456def",
  "observacoes": "Cliente pediu atenção especial aos bancos",
  "valorTotal": 400.00,
  "createdAt": "2026-01-10T15:00:00.000Z",
  "updatedAt": "2026-01-10T15:00:00.000Z",
  "cliente": {
    "id": "clt_123abc",
    "nome": "João Silva",
    "telefone": "11999999999",
    "email": "joao@example.com"
  },
  "veiculo": {
    "id": "vec_456def",
    "marca": "Toyota",
    "modelo": "Corolla",
    "placa": "ABC1234",
    "cor": "Prata"
  },
  "servicos": [
    {
      "id": "ags_001",
      "servicoId": "srv_222bbb",
      "preco": 100.00,
      "servico": {
        "id": "srv_222bbb",
        "nome": "Lavagem Completa",
        "descricao": "Lavagem externa e interna completa",
        "duracaoMinutos": 60
      }
    },
    {
      "id": "ags_002",
      "servicoId": "srv_333ccc",
      "preco": 300.00,
      "servico": {
        "id": "srv_333ccc",
        "nome": "Polimento Técnico",
        "descricao": "Polimento profissional com cera",
        "duracaoMinutos": 120
      }
    }
  ],
  "notificacoes": [
    {
      "id": "ntf_001",
      "tipo": "CONFIRMACAO",
      "status": "ENVIADA",
      "enviadaEm": "2026-01-10T15:05:00.000Z"
    }
  ]
}
```

### POST /api/agendamentos

Cria novo agendamento.

**Request:**
```http
POST /api/agendamentos
Content-Type: application/json

{
  "clienteId": "clt_123abc",
  "veiculoId": "vec_456def",
  "dataHora": "2026-01-16T10:00:00.000Z",
  "servicos": [
    {
      "servicoId": "srv_111aaa",
      "preco": 50.00
    },
    {
      "servicoId": "srv_222bbb",
      "preco": 100.00
    }
  ],
  "observacoes": "Cliente chegará 10min antes"
}
```

**Validações:**
| Campo | Regras |
|-------|--------|
| clienteId | string, deve existir, obrigatório |
| veiculoId | string, opcional |
| dataHora | ISO 8601 DateTime, futuro, obrigatório |
| servicos | array, min: 1, obrigatório |
| servicos[].servicoId | string, deve existir, obrigatório |
| servicos[].preco | number, min: 0, obrigatório |
| observacoes | string, max: 500, opcional |

**Validações de Negócio:**
- Data/hora deve estar no futuro
- Não pode ter conflito com outro agendamento
- Cliente deve existir
- Veículo (se fornecido) deve pertencer ao cliente
- Todos os serviços devem existir e estar ativos

**Response 201 Created:**
```json
{
  "id": "agd_new123",
  "dataHora": "2026-01-16T10:00:00.000Z",
  "status": "PENDENTE",
  "clienteId": "clt_123abc",
  "veiculoId": "vec_456def",
  "observacoes": "Cliente chegará 10min antes",
  "valorTotal": 150.00,
  "createdAt": "2026-01-12T14:00:00.000Z",
  "updatedAt": "2026-01-12T14:00:00.000Z",
  "cliente": {
    "id": "clt_123abc",
    "nome": "João Silva"
  },
  "veiculo": {
    "id": "vec_456def",
    "marca": "Toyota",
    "modelo": "Corolla"
  },
  "servicos": [
    {
      "id": "ags_new001",
      "servicoId": "srv_111aaa",
      "preco": 50.00,
      "servico": {
        "nome": "Lavagem Simples"
      }
    },
    {
      "id": "ags_new002",
      "servicoId": "srv_222bbb",
      "preco": 100.00,
      "servico": {
        "nome": "Lavagem Completa"
      }
    }
  ]
}
```

**Response 400 Bad Request (Validação):**
```json
{
  "statusCode": 400,
  "message": [
    "dataHora deve ser uma data futura",
    "servicos deve conter pelo menos 1 item"
  ],
  "error": "Bad Request"
}
```

**Response 400 Bad Request (Conflito):**
```json
{
  "statusCode": 400,
  "message": "Já existe um agendamento neste horário",
  "error": "Bad Request"
}
```

### PATCH /api/agendamentos/:id

Atualiza agendamento (status, data/hora, observações).

**Request:**
```http
PATCH /api/agendamentos/agd_789ghi
Content-Type: application/json

{
  "status": "CONFIRMADO",
  "observacoes": "Cliente confirmou presença"
}
```

**Campos permitidos:**
- status: "PENDENTE" | "CONFIRMADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO" | "NAO_COMPARECEU"
- dataHora: ISO 8601 DateTime (verifica conflito)
- veiculoId: string
- observacoes: string

**Response 200 OK:**
```json
{
  "id": "agd_789ghi",
  "dataHora": "2026-01-15T14:00:00.000Z",
  "status": "CONFIRMADO",
  "observacoes": "Cliente confirmou presença",
  "updatedAt": "2026-01-12T14:30:00.000Z"
}
```

### DELETE /api/agendamentos/:id

Cancela agendamento (muda status para CANCELADO).

**Request:**
```http
DELETE /api/agendamentos/agd_789ghi
```

**Response 204 No Content**

**Nota:** Não deleta fisicamente, apenas muda status para "CANCELADO".

---

## 🔔 Notificações API

> **Fase 3**: WhatsApp + Notificações

### POST /api/notificacoes/enviar

Envia notificação via WhatsApp.

**Request:**
```http
POST /api/notificacoes/enviar
Content-Type: application/json

{
  "agendamentoId": "agd_789ghi",
  "tipo": "LEMBRETE_24H",
  "telefone": "11999999999",
  "mensagem": "Olá João! Lembrete: você tem agendamento amanhã às 14h."
}
```

**Response 200 OK:**
```json
{
  "id": "ntf_456",
  "agendamentoId": "agd_789ghi",
  "tipo": "LEMBRETE_24H",
  "status": "ENVIADA",
  "enviadaEm": "2026-01-14T14:00:00.000Z"
}
```

---

## 🔗 Webhooks API

> **Fase 4**: Integração WhatsApp + IA

### POST /api/webhooks/whatsapp

Recebe webhooks do WhatsApp Business API.

**Request:**
```http
POST /api/webhooks/whatsapp
Content-Type: application/json
X-Hub-Signature: sha256=...

{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "11999999999",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{
          "profile": {
            "name": "João Silva"
          },
          "wa_id": "5511999999999"
        }],
        "messages": [{
          "from": "5511999999999",
          "id": "wamid.xxx",
          "timestamp": "1673000000",
          "text": {
            "body": "Quero agendar uma lavagem completa para amanhã"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

**Response 200 OK:**
```json
{
  "success": true
}
```

---

## 📊 Códigos de Status HTTP

### Success Codes
| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Requisição bem-sucedida (GET, PATCH) |
| 201 | Created | Recurso criado (POST) |
| 204 | No Content | Ação bem-sucedida sem retorno (DELETE) |

### Client Error Codes
| Código | Significado | Uso |
|--------|-------------|-----|
| 400 | Bad Request | Validação falhou, dados inválidos |
| 401 | Unauthorized | Não autenticado |
| 403 | Forbidden | Sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: telefone duplicado) |
| 422 | Unprocessable Entity | Validação semântica falhou |
| 429 | Too Many Requests | Rate limit excedido |

### Server Error Codes
| Código | Significado | Uso |
|--------|-------------|-----|
| 500 | Internal Server Error | Erro inesperado do servidor |
| 503 | Service Unavailable | Serviço temporariamente indisponível |

---

## ❌ Error Handling

### Formato de Erro Padrão

```json
{
  "statusCode": 400,
  "message": "Mensagem de erro",
  "error": "Bad Request",
  "timestamp": "2026-01-12T10:30:00.000Z",
  "path": "/api/clientes"
}
```

### Erros de Validação (Multiple)

```json
{
  "statusCode": 400,
  "message": [
    "nome deve ter no mínimo 3 caracteres",
    "telefone deve ter formato válido (10-11 dígitos)",
    "email deve ser um email válido"
  ],
  "error": "Bad Request"
}
```

### Erros Específicos

**Recurso não encontrado:**
```json
{
  "statusCode": 404,
  "message": "Cliente com ID clt_123 não encontrado",
  "error": "Not Found"
}
```

**Conflito de unicidade:**
```json
{
  "statusCode": 409,
  "message": "Telefone já cadastrado",
  "error": "Conflict"
}
```

**Conflito de agendamento:**
```json
{
  "statusCode": 400,
  "message": "Já existe um agendamento neste horário",
  "error": "Bad Request",
  "details": {
    "dataHora": "2026-01-15T14:00:00.000Z",
    "conflito": {
      "id": "agd_existente",
      "cliente": "Outro Cliente"
    }
  }
}
```

**Validação de negócio:**
```json
{
  "statusCode": 400,
  "message": "Não é possível agendar em data passada",
  "error": "Bad Request"
}
```

---

## 🔐 Autenticação (Fase 2)

### Bearer Token

Após autenticação, incluir token em todas as requisições:

```http
GET /api/clientes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expirado

**Response 401:**
```json
{
  "statusCode": 401,
  "message": "Token expirado",
  "error": "Unauthorized"
}
```

**Solução:** Usar refresh token para obter novo access token.

---

## 📝 Notas de Implementação

### Rate Limiting

```
Limite: 100 requisições por minuto por IP
Header: X-RateLimit-Limit: 100
Header: X-RateLimit-Remaining: 95
Header: X-RateLimit-Reset: 1673000000
```

**Response 429:**
```json
{
  "statusCode": 429,
  "message": "Muitas requisições. Tente novamente em 60 segundos.",
  "error": "Too Many Requests",
  "retryAfter": 60
}
```

### CORS

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### Versionamento (Futuro)

```
v1: /api/clientes (atual)
v2: /api/v2/clientes (futuro)
```

---

## ✅ Checklist de Endpoints

### Fase 1 (MVP)
- [x] GET /api/clientes
- [x] GET /api/clientes/:id
- [x] GET /api/clientes/search
- [x] POST /api/clientes
- [x] PATCH /api/clientes/:id
- [x] DELETE /api/clientes/:id
- [x] GET /api/veiculos
- [x] GET /api/veiculos/:id
- [x] POST /api/veiculos
- [x] PATCH /api/veiculos/:id
- [x] DELETE /api/veiculos/:id
- [x] GET /api/servicos
- [x] GET /api/servicos/:id
- [x] POST /api/servicos
- [x] PATCH /api/servicos/:id
- [x] DELETE /api/servicos/:id
- [x] GET /api/agendamentos
- [x] GET /api/agendamentos/disponiveis
- [x] GET /api/agendamentos/:id
- [x] POST /api/agendamentos
- [x] PATCH /api/agendamentos/:id
- [x] DELETE /api/agendamentos/:id

### Fase 2 (Autenticação)
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register
- [ ] POST /api/auth/refresh
- [ ] POST /api/auth/logout

### Fase 3 (Notificações)
- [ ] POST /api/notificacoes/enviar
- [ ] GET /api/notificacoes/templates
- [ ] POST /api/notificacoes/agendar

### Fase 4 (WhatsApp)
- [ ] POST /api/webhooks/whatsapp
- [ ] GET /api/webhooks/verify

---

**Versão**: 1.0
**Data**: 2026-01-12
**Documentos Relacionados**: ARCHITECTURE.md, REQUIREMENTS.md, SETUP-GUIDE.md
