# E-Commerce Platform — Technical Specification and Delivery Plan

## Project

Plataforma de e-commerce para loja de roupas com:

- catalogo de produtos
- autenticacao de usuarios
- painel administrativo
- controle de estoque
- integracao com pagamentos
- calculo de frete
- upload de imagens
- observabilidade
- CI/CD
- arquitetura segura e escalavel

---

## 1. Decision Record

Esta spec substitui a versao anterior como referencia tecnica oficial do projeto.

Decisoes assumidas:

- O backend oficial permanece em Node.js + TypeScript.
- O framework HTTP oficial permanece Express.
- O acesso a banco permanece em PostgreSQL com Prisma para schema e migracoes, sem reescrever o projeto para Python/FastAPI.
- A arquitetura oficial do backend segue Clean Architecture pragmatica com modulos por dominio.
- A spec passa a servir a dois objetivos: descrever a baseline real do sistema e organizar a implementacao do que ainda falta.

---

## 2. System Goals

### Main goals

- Permitir compra de produtos online.
- Gerenciar catalogo e estoque.
- Processar pagamentos com seguranca.
- Gerenciar pedidos e entregas.
- Disponibilizar painel administrativo.
- Garantir escalabilidade, seguranca e manutenibilidade.

---

## 3. Official Stack

### Frontend

| Tecnologia | Uso |
| ---------- | --- |
| React | UI |
| TypeScript | Tipagem |
| Vite | Build |
| TailwindCSS | Estilizacao |
| React Router | Rotas |
| TanStack Query | Data fetching |
| React Context | Estado de autenticacao, carrinho e pedidos |
| Vitest | Testes frontend |

Deploy alvo:

- Vercel

### Backend

| Tecnologia | Uso |
| ---------- | --- |
| Node.js | Runtime |
| TypeScript | Tipagem |
| Express | API HTTP |
| Prisma | Schema e migracoes |
| PostgreSQL | Banco relacional |
| Structured JSON logging | Observabilidade |

Deploy alvo:

- Render

### Infra complementar prevista

| Tecnologia | Uso |
| ---------- | --- |
| AWS S3 ou storage compativel | Upload de imagens |
| Redis | Cache e jobs assinc, fase futura |
| GitHub Actions | CI/CD |

---

## 4. Architecture

### Target model

```txt
Frontend (React)
    ↓
Express Backend
    ↓
PostgreSQL
S3 or local storage
Mercado Pago
Shipping provider
```

### Backend architecture principles

- Separacao de responsabilidades por modulo de dominio.
- Camadas internas com `domain`, `application`, `infra` e composicao em `main`.
- Dependencias sempre apontam de fora para dentro.
- Regras de negocio ficam em use cases e servicos de dominio, nunca em routes.

### Current backend structure

```txt
backend/
├── prisma/
├── public/
├── server/
└── src/
    ├── main/
    ├── modules/
    │   ├── audit/
    │   ├── billing/
    │   ├── catalog/
    │   ├── identity/
    │   ├── sales/
    │   ├── shipping/
    │   └── uploads/
    └── shared/
```

### Bounded contexts

| Contexto | Responsabilidade |
| -------- | ---------------- |
| Identity | autenticacao, autorizacao, OAuth, perfil |
| Catalog | produtos, imagens, categorias, variacoes |
| Sales | carrinho futuro, pedidos, checkout |
| Billing | pagamentos e webhook |
| Shipping | calculo de frete e rastreamento futuro |
| Audit | trilha de auditoria administrativa |
| Uploads | signed upload e storage |

---

## 5. Data and Persistence

### Official database

- PostgreSQL

### Main entities already in scope

- users
- sessions
- products
- product_variants
- product_images
- orders
- order_items
- audit_logs
- oauth_login_results

### Main entities still required

- categories
- payments
- shipments
- inventory_movements
- refresh_tokens

### Soft delete strategy

Adicionar `deleted_at` em:

- products
- users
- categories

Regra:

- delete funcional deve ser logico por padrao.
- delete fisico fica restrito a scripts operacionais ou manutencao excepcional.

---

## 6. Authentication and Authorization

### Roles

```txt
CUSTOMER
ADMIN
SUPER_ADMIN
```

### RBAC

| Acao | CUSTOMER | ADMIN | SUPER_ADMIN |
| ---- | -------- | ----- | ----------- |
| Comprar | ✅ | ✅ | ✅ |
| CRUD Produtos | ❌ | ✅ | ✅ |
| Gerenciar Estoque | ❌ | ✅ | ✅ |
| Gerenciar Pedidos | ❌ | ✅ | ✅ |
| Criar Admins | ❌ | ❌ | ✅ |

### Session strategy

Estado atual:

- autenticacao por access token persistido em storage do frontend
- sessoes registradas em banco por token aleatorio

Meta de producao:

- access token de curta duracao
- refresh token HttpOnly cookie
- rotacao e revogacao de refresh tokens
- endpoint de refresh

### OAuth

Provider oficial:

- Google OAuth2

Fluxo oficial:

- Authorization Code Flow com callback no backend

Endpoints previstos:

- `GET /auth/google`
- `GET /auth/google/callback`
- `POST /auth/google/exchange`

### Features obrigatorias do modulo de usuarios

- registro
- login
- logout
- OAuth Google
- recuperacao de senha
- verificacao de email

---

## 7. Catalog and Inventory

### Product features

- CRUD de produtos
- upload de imagens
- categorias
- variacoes
- controle de estoque

### Required product fields

```txt
name
description
price
sale_price
sku
stock_quantity
weight
height
width
length
```

### Inventory rules

- estoque reduz apenas apos pagamento aprovado
- nunca permitir estoque negativo
- operacoes criticas devem ser transacionais
- cada alteracao de estoque relevante deve gerar movement log em fase futura

### Inventory movements

Tabela obrigatoria futura:

- inventory_movements

Campos minimos previstos:

- id
- product_id
- variant_id opcional
- movement_type
- quantity
- reason
- actor_user_id opcional
- created_at

---

## 8. Cart, Checkout and Orders

### Cart

Funcionalidades alvo:

- adicionar item
- remover item
- atualizar quantidade
- persistencia para usuario autenticado

### Checkout flow

```txt
Carrinho
→ endereco
→ calculo frete
→ pagamento
→ confirmacao
```

### Order statuses

```txt
PENDING
PAID
PROCESSING
SHIPPED
DELIVERED
CANCELLED
REFUNDED
```

### Critical order rules

- frontend nunca confirma pagamento
- backend cria tentativa de pagamento
- webhook oficial confirma pagamento
- pedidos e estoque devem permanecer consistentes sob falhas e retries

---

## 9. Payments

### Gateway

- Mercado Pago

### Rules

- backend cria preferencia ou checkout
- frontend apenas redireciona ou apresenta UI do gateway
- webhook oficial confirma o pagamento
- webhook precisa validar assinatura quando disponivel
- webhook precisa ser idempotente
- o endpoint deve responder rapido e delegar processamento adicional quando necessario

### Payment endpoints target

- `POST /payments/create`
- `POST /payments/webhook`

Mapeamento com o codigo atual:

- o projeto hoje usa rotas sob `/payments/mercado-pago`
- manter esse namespace e documentar alias somente se necessario

---

## 10. Shipping

### Provider strategy

Estado atual:

- calculo simulado baseado em estado, volume e subtotal

Meta:

- integracao com provider real de frete

### Modalidades

```txt
PAC
SEDEX
```

### Regras

- calculo deve considerar CEP, estado e itens do pedido
- provider externo deve ter timeout e fallback controlado
- resultados podem ser cacheados

---

## 11. Image Upload

### Official flow

```txt
Frontend solicita signed URL
↓
Backend gera signed URL
↓
Upload direto para S3 ou storage compativel
↓
Backend salva metadata
```

### Rules

- validar mime type permitido
- limitar tamanho maximo por configuracao
- rastrear content type, storage key e URL publica
- manter opcao de storage local em desenvolvimento

---

## 12. Security

### Password hash

Estado atual:

- Scrypt

Meta recomendada:

- Argon2id

### Rate limiting

Aplicar em:

```txt
login
register
forgot-password
payments
webhooks
```

### Security headers obrigatorios

- CSP
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### CORS

Permitir apenas:

- frontend oficial
- origens explicitas por ambiente

### Input validation

- validacao de request obrigatoria em endpoints publicos e administrativos
- sanitizacao de entrada quando aplicavel
- nunca confiar no frontend para regra critica

### Idempotencia

Obrigatoria para:

- pagamentos
- checkout
- webhooks

### Sensitive logs

Nunca logar:

- senha
- access token
- refresh token
- cookies
- dados sensiveis de pagamento

### Secrets

Nunca:

- commitar `.env`
- hardcode secrets

Usar:

- variaveis de ambiente por plataforma de deploy

---

## 13. Observability

### Logs

- structured JSON logs

### Required fields

```json
{
  "timestamp": "",
  "request_id": "",
  "user_id": "",
  "route": "",
  "status_code": "",
  "message": ""
}
```

### Correlation ID

Header obrigatorio:

```txt
X-Request-ID
```

### Goals

- tracing de requests
- auditoria administrativa
- troubleshooting de pagamentos
- investigacao de falhas de integracao

---

## 14. Cache and Async Work

### Planned technology

- Redis

### Planned cache targets

- produtos
- categorias
- calculo frete

### Planned async jobs

```txt
emails
webhooks
image_processing
audit_logs secundarios
notifications
```

Observacao:

- jobs assinc e cache ficam apos a fase de seguranca e estabilizacao da API.

---

## 15. CI/CD and Docker

### Platform

- GitHub Actions

### Pipeline target

```txt
lint
tests
build
docker build
security scan
deploy
```

### Security checks target

Frontend:

- npm audit

Backend:

- npm audit
- checagem de tipos
- linter backend quando configurado

### Docker targets

```txt
frontend
backend
redis
```

---

## 16. Environments

### Official environments

```txt
development
production
```

### Environment rules

- configuracoes devem ser separadas por ambiente
- CORS, cookies, URLs publicas e secrets nao podem compartilhar defaults inseguros em producao

---

## 17. API Surface

### Auth

```http
POST /auth/register
POST /auth/login
GET /auth/google
GET /auth/google/callback
POST /auth/google/exchange
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
```

### Products

```http
GET /products
GET /products/:id
POST /products
PUT /products/:id
DELETE /products/:id
```

### Categories

```http
GET /categories
POST /categories
PUT /categories/:id
DELETE /categories/:id
```

### Orders

```http
POST /orders
GET /orders
GET /orders/:id
PATCH /orders/:id/status
```

### Shipping

```http
POST /shipping/calculate
```

### Uploads

```http
POST /uploads/sign
PUT /uploads/local
```

### Payments

```http
POST /payments/mercado-pago/checkout
POST /payments/mercado-pago/webhook
```

---

## 18. Performance and Quality Goals

### Frontend

- lazy loading
- image optimization
- code splitting

### Backend

- queries otimizadas
- indices PostgreSQL
- paginacao em listagens extensas

### Non-functional goals

| Objetivo | Meta |
| -------- | ---- |
| Seguranca | Alta |
| Escalabilidade | Media/Alta |
| Disponibilidade | Alta |
| Performance | <300ms nas APIs principais sem integracoes externas |
| Observabilidade | Completa |
| Manutenibilidade | Alta |

---

## 19. Privacy and Compliance

Sistema deve evoluir para:

- permitir exclusao de conta
- permitir remocao de dados pessoais quando aplicavel
- possuir politica de privacidade

---

## 20. Code Quality Standards

### SOLID

O sistema deve seguir principios SOLID:

| Principio | Aplicacao |
| --------- | --------- |
| S | Single Responsibility |
| O | Open/Closed |
| L | Liskov Substitution |
| I | Interface Segregation |
| D | Dependency Inversion |

### Repository pattern

Persistencia deve continuar encapsulada por repositories.

Exemplos esperados:

- ProductRepository
- OrderRepository
- UserRepository

### Service layer and use cases

Regras de negocio complexas devem ficar em:

- use cases
- services de dominio

Nunca em:

- controllers
- routes

### DTO and schema pattern

Utilizar DTOs e schemas para:

- requests
- responses
- integracao externa

### Code style

Regras:

- tipagem obrigatoria
- funcoes pequenas
- evitar codigo duplicado
- evitar funcoes gigantes
- evitar logica em controllers

### Naming conventions

Backend:

- seguir convencoes idiomaticas do projeto atual em TypeScript

Frontend:

- camelCase para simbolos e props

Commits:

- Conventional Commits

---

## 21. Testing Strategy

### Frontend tests

| Tipo | Ferramenta |
| ---- | ---------- |
| Component tests | Vitest |
| UI tests | React Testing Library |
| E2E | ferramenta a definir |

### Backend tests

| Tipo | Ferramenta |
| ---- | ---------- |
| Unit tests | framework TypeScript a definir |
| Integration tests | framework TypeScript a definir |
| API tests | framework TypeScript a definir |

### Coverage target

- minimo de 80% nos casos criticos ao final da estabilizacao da plataforma

### Critical test cases

Devem possuir cobertura automatizada:

- auth
- refresh token
- OAuth
- autorizacao RBAC
- checkout
- criacao pedido
- pagamento
- atualizacao estoque
- webhook Mercado Pago
- idempotencia de webhook
- reducao estoque
- prevencao estoque negativo
- calculo frete
- timeout provider frete
- upload imagens
- validacao mime type

### Test database

- banco isolado para testes backend

---

## 22. Definition of Done

Uma feature so sera considerada concluida quando:

- codigo implementado
- testes criados quando a feature exigir comportamento critico
- lint aprovado
- typecheck aprovado
- review realizado
- logs adicionados quando a feature for operacionalmente relevante
- documentacao atualizada
- CI aprovado quando existir pipeline
- sem vulnerabilidades criticas conhecidas relacionadas a mudanca

---

## 23. Delivery Phases

### Phase 1 — Security and Production Baseline

Objetivo:

- tornar a API utilizavel em ambiente real com riscos basicos controlados

Escopo:

- refresh token e politica de sessao
- rate limiting
- security headers
- CORS restrito
- validacao de input
- soft delete inicial
- padronizacao de erros e requests sensiveis

Entrega considerada completa quando:

- autenticacao suportar refresh seguro
- endpoints publicos estiverem protegidos por validacao e rate limit
- app nao aceitar origem arbitraria em producao

### Phase 2 — Commerce Core Completion

Objetivo:

- completar o nucleo funcional de e-commerce previsto na spec

Escopo:

- categorias
- carrinho persistido
- inventory movements
- forgot/reset password
- verificacao de email
- ajustes de estados de pedidos e estoque apos webhook

### Phase 3 — Admin and Operations

Objetivo:

- fechar lacunas de operacao da loja

Escopo:

- painel admin completo no frontend
- dashboard operacional
- gestao de pedidos
- gestao de admins
- auditoria expandida

### Phase 4 — Platform Hardening

Objetivo:

- preparar deploy e manutencao continua

Escopo:

- testes automatizados backend e frontend
- GitHub Actions
- Docker
- npm audit e quality gates
- documentacao operacional

### Phase 5 — Scale Features

Objetivo:

- evoluir capacidade de escala e integracoes reais

Escopo:

- Redis cache
- jobs assinc
- provider real de frete
- melhorias de observabilidade
- LGPD e politicas operacionais

---

## 24. Immediate Backlog

Ordem recomendada para as proximas implementacoes:

1. Refresh token com persistencia e endpoint de refresh.
2. CORS restrito e security headers.
3. Rate limiting em auth e pagamentos.
4. Validacao de input nos endpoints publicos e administrativos.
5. Forgot/reset password.
6. Categorias e soft delete.
7. Inventory movements e consistencia de estoque apos webhook.
8. Testes automatizados dos fluxos criticos.
9. CI/CD minimo com lint, build e typecheck.

---

## 25. Implementation Rule

Toda nova feature deve obedecer a este criterio:

- nao duplicar stack nem criar segunda arquitetura paralela
- partir sempre da estrutura atual do repositorio
- priorizar a correcao do nucleo de producao antes de expandir features cosmeticas
