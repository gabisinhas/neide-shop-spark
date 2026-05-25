- `FRONTEND_ALLOWED_ORIGINS`: lista opcional separada por virgula com origens extras permitidas via CORS.
- `TRUST_PROXY`: habilita `trust proxy` quando a API estiver atras de Render, Nginx ou outro proxy reverso.
- `API_JSON_LIMIT`: limite do corpo JSON aceito pela API.
- `AUTH_COOKIE_DOMAIN`: dominio opcional compartilhado pelos cookies de autenticacao em producao.
- `AUTH_COOKIE_SAME_SITE`: politica do cookie de refresh (`lax`, `strict` ou `none`).
- `AUTH_COOKIE_SECURE`: forca ou desabilita o atributo `Secure`; por padrao fica ativo em HTTPS/producao.
- `AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS`: validade do cookie de refresh em segundos.
- `RATE_LIMIT_API_WINDOW_MINUTES` e `RATE_LIMIT_API_MAX`: limite geral da API.
- `RATE_LIMIT_AUTH_WINDOW_MINUTES` e `RATE_LIMIT_AUTH_MAX`: limite para login, register, refresh e OAuth.
- `RATE_LIMIT_PAYMENT_WINDOW_MINUTES` e `RATE_LIMIT_PAYMENT_MAX`: limite para checkout de pagamento.
- `RATE_LIMIT_WEBHOOK_WINDOW_MINUTES` e `RATE_LIMIT_WEBHOOK_MAX`: limite para recebimento de webhooks.

## Hardening de producao

O backend agora sobe com ajustes basicos de producao:

- `helmet` para headers defensivos;
- CORS restrito a origens explicitas;
- `trust proxy` configuravel por ambiente;
- rate limiting para API, auth, checkout e webhook;
- cookie de refresh token via `HttpOnly`, com politica configuravel de `SameSite`, `Secure`, dominio e expiracao.

Para deploy real, ajuste pelo menos:

- `FRONTEND_APP_URL` para a URL publica do frontend;
- `FRONTEND_ALLOWED_ORIGINS` se houver painel, preview ou dominio adicional;
- `TRUST_PROXY=true` quando a API estiver atras de proxy reverso;
- `GOOGLE_OAUTH_STATE_SECRET` com valor dedicado e forte em producao;
- `AUTH_COOKIE_SAME_SITE` e `AUTH_COOKIE_DOMAIN` conforme a topologia real entre frontend e API;
- limites de rate limit conforme seu trafego esperado.

# Backend Architecture

Este backend foi reorganizado para servir como base de Clean Architecture + DDD para a loja.

## Modulos de dominio

- `catalog`: catalogo e gestao de produtos.
- `identity`: usuarios, autenticacao e perfis.
- `sales`: pedidos, itens, status e historico.
- `billing`: pagamentos e integracao com Mercado Pago.

## Camadas

- `domain`: entidades, contratos e regras centrais.
- `application`: casos de uso e DTOs.
- `infra`: persistencia, controllers HTTP, gateways externos.
- `main`: composicao da aplicacao, bootstrap e rotas.

## O que o frontend exige hoje

- `GET/POST/PUT/DELETE /api/products`
- `POST /api/auth/google`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `POST /api/auth/google/exchange`
- cadastro e login de usuarios por email
- criacao e consulta de pedidos por usuario
- atualizacao de status de pedidos no admin
- checkout com `pix`, `credit_card` e `bank_slip`
- integracao Mercado Pago para iniciar pagamento e receber webhook

## Endpoints implementados

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/google`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `POST /api/auth/google/exchange`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `PATCH /api/users/:id/role`
- `GET /api/audit-logs`
- `POST /api/uploads/sign`
- `PUT /api/uploads/local`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`
- `POST /api/payments/mercado-pago/checkout`
- `POST /api/payments/mercado-pago/webhook`

## Banco de dados

Ao iniciar, o backend garante as tabelas:

- `products`
- `users`
- `sessions`
- `orders`
- `order_items`
- `audit_logs`

Tambem faz seed do super admin `superadmin@nscloset.com` com senha `admin123`.

## Observabilidade

O backend agora emite logs estruturados JSON para rotas criticas, sempre com:

- `timestamp`
- `request_id`
- `user_id`
- `route`
- `status_code`
- `message`

Rotas sensiveis como `auth`, `users`, `orders`, `payments` e `audit-logs` sao registradas com access log no fim da resposta, alem do `traceId` compartilhado via header `x-request-id`.

## Variaveis de ambiente

- `DATABASE_URL`: conexao com PostgreSQL.
- `PORT`: porta da API.
- `APP_BASE_URL`: URL publica usada em callbacks e webhook do Mercado Pago.
- `FRONTEND_APP_URL`: URL publica do frontend para onde o backend redireciona apos o callback.
- `UPLOAD_SIGNING_SECRET`: segredo usado para assinar uploads locais de desenvolvimento.
- `AWS_S3_BUCKET`: bucket usado para upload assinado em producao.
- `AWS_S3_REGION`: regiao do bucket S3.
- `AWS_ACCESS_KEY_ID`: credencial AWS usada na assinatura.
- `AWS_SECRET_ACCESS_KEY`: segredo AWS usado na assinatura.
- `AWS_S3_PUBLIC_BASE_URL`: URL publica opcional do bucket ou CDN.
- `GOOGLE_CLIENT_ID`: client id do Google usado na autorizacao e na validacao do `id_token`.
- `GOOGLE_CLIENT_SECRET`: segredo OAuth do Google usado para trocar o `code` por token.
- `GOOGLE_OAUTH_STATE_SECRET`: segredo dedicado para assinar e validar o `state` do fluxo OAuth. Em producao ele passa a ser obrigatorio.
- `GOOGLE_REDIRECT_URI`: callback configurado no Google Console. Em local: `http://localhost:3001/api/auth/google/callback`.
- `FRONTEND_GOOGLE_CALLBACK_PATH`: rota do frontend que consome o token de troca gerado pelo backend.
- `MERCADO_PAGO_ACCESS_TOKEN`: token de producao ou sandbox do Mercado Pago.
- `ALLOW_UNSAFE_GOOGLE_AUTH_DEV`: permite fallback local para testes de login Google sem verificacao real do token. Ignorado em producao.

## Upload de imagem

O cadastro de produto agora usa upload assinado em duas etapas:

1. O frontend chama `POST /api/uploads/sign`.
2. O backend retorna uma URL assinada de upload.
3. O navegador envia o JPEG diretamente para a URL recebida.
4. O produto e salvo com a URL publica final e metadados de storage.

Sem configuracao AWS, o backend usa um fallback local assinado e grava em `backend/public/assets/uploads`.
Com as variaveis AWS preenchidas, o fluxo passa a assinar upload direto para S3.

## Configuracao do Google Login

Este projeto agora usa OAuth real por redirecionamento no backend.

O fluxo atual e:

1. O frontend redireciona o usuario para `GET /api/auth/google`.
2. O backend envia o usuario para o Google com `state` assinado e nonce em cookie HttpOnly.
3. O Google retorna para `GET /api/auth/google/callback` no backend.
4. O backend troca o `code` por `id_token`, autentica o usuario e cria um token temporario de troca.
5. O backend redireciona o browser para o frontend em `/entrar/google/callback?token=...`.
6. O frontend chama `POST /api/auth/google/exchange` para receber `accessToken` e `user`.

Para funcionar localmente, configure:

- no frontend: `VITE_API_URL=http://localhost:3001/api`;
- no backend: `APP_BASE_URL=http://localhost:3001` e `FRONTEND_APP_URL=http://localhost:5173`;
- no backend: `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` do Google Console;
- no Google Console: `Authorized redirect URIs` com `http://localhost:3001/api/auth/google/callback`.

Nesse fluxo, `Authorized JavaScript origins` nao e o ponto principal da autenticacao, porque o navegador nao recebe o token do Google diretamente.

Em producao, configure obrigatoriamente:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_OAUTH_STATE_SECRET`
- `GOOGLE_REDIRECT_URI` apontando para a URL publica real do backend

O fallback inseguro controlado por `ALLOW_UNSAFE_GOOGLE_AUTH_DEV` permanece restrito a ambiente nao produtivo.

## Sessao e Refresh Token

O backend agora trabalha com dois artefatos de autenticacao:

- `accessToken`: retornado no corpo das respostas de login e refresh, usado no header `Authorization`.
- `refresh_token`: enviado em cookie `HttpOnly`, com `SameSite`, `Secure`, `Domain` e expiracao configuraveis por ambiente, renovado em `POST /api/auth/refresh`.

Fluxo esperado no frontend:

1. `POST /api/auth/login` ou `POST /api/auth/register` retorna `accessToken` e grava o cookie de refresh.
2. O frontend usa o `accessToken` normalmente nas chamadas autenticadas.
3. Ao receber `401`, o frontend tenta `POST /api/auth/refresh` com `credentials: include`.
4. O backend valida o cookie, rotaciona o refresh token e devolve novo `accessToken`.
5. `POST /api/auth/logout` remove a sessao atual e expira o cookie de refresh.

## Proximos passos recomendados

1. Migrar o frontend de `localStorage` para esses endpoints.
2. Adicionar middleware de autenticacao por sessao ou JWT nas rotas protegidas.
3. Trocar o fallback de Google por validacao estrita de token em ambiente produtivo.
4. Persistir eventos de pagamento e conciliar webhook com auditoria.
