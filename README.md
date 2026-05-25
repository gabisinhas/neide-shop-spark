# Neide Shop Spark

Estrutura em monorepo com dois projetos separados:

- `frontend/`: loja e admin em React + Vite
- `backend/`: API em Express + PostgreSQL

## Como rodar

1. Instale as dependências na raiz:

```sh
npm install
```

2. Configure os ambientes:

- `frontend/.env` a partir de `frontend/.env.example`
- `backend/.env` a partir de `backend/.env.example`

3. Rode o backend:

```sh
npm run dev:backend
```

4. Em outro terminal, rode o frontend:

```sh
npm run dev:frontend
```

## Scripts úteis

```sh
npm run build
npm run lint
npm run test
npm run typecheck:backend
```

## Observação

Essa estrutura já está preparada para uma futura separação em dois repositórios, porque frontend e backend têm dependências, scripts e variáveis de ambiente próprios.
