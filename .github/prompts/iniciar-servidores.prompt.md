---
description: Inicia os servidores de desenvolvimento do backend e frontend do DMS.
name: iniciar-servidores
agent: agent
---

# Iniciar servidores do DMS

Inicie os servidores de desenvolvimento do Document Management System usando dois terminais separados.

## Backend

1. A partir da raiz do workspace, execute `npm run dev` dentro de `backend`.
2. O backend deve escutar na porta configurada por `PORT`, usando `3000` como padrão.
3. Verifique `GET http://localhost:3000/health` e confirme uma resposta com `status: ok`.

## Frontend

1. Em um segundo terminal, execute `npm run dev` dentro de `frontend`.
2. O frontend deve escutar na porta configurada pelo Vite, usando `5173` como padrão.
3. Informe a URL exibida pelo Vite ao final da inicialização.

## Regras de execução

- Verifique se já existe um processo usando as portas antes de iniciar cada servidor.
- Se o servidor já estiver ativo e respondendo, reutilize-o e não inicie uma segunda instância.
- Não execute `npm install`, não altere arquivos do projeto e não use provedores externos.
- Mantenha os dois processos ativos para desenvolvimento.
- Ao finalizar, informe o status de cada servidor e suas URLs.
