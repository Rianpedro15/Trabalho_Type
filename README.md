# EVENTOS FACUL

Gerenciador de eventos da faculdade, com cadastro, login e banco de dados MySQL.
Projeto da disciplina — Grupo Anchieta, 2026. Grupo: ______________ (integrantes).

## Como rodar

1. Crie o banco: rode `eventos.sql` inteiro no MySQL Workbench.
2. Na pasta `api`, copie `.env.exemplo` para `.env` e preencha `DB_SENHA` (senha do MySQL) e `JWT_SEGREDO`.
3. Na pasta `api`: `npm install` e depois `npm run dev` (porta 3000).
4. Em outro terminal, na pasta do projeto: `npm install` e depois `npm run dev`.
5. Abra http://localhost:5173 e entre com o usuário de demonstração:
   `admin@eventosfacul.dev` / `senha123` (ou `aluno@eventosfacul.dev` / `senha123`).

Conferir os tipos: `npm run verificar` (nas duas pastas).

Nota: a API do TaskFlow do professor e a nossa usam a porta 3000. Rode uma de cada vez.

## Estrutura

- `src/` — a página (TypeScript + Vite)
- `api/src/` — a API (Express + mysql2), com login (bcrypt + JWT)
- `eventos.sql` — o script do banco de dados (tabelas, dados de exemplo e consultas)
- `css/` — a aparência da página

## O que o sistema faz

- Cadastro, login e saída: cada pessoa vê e altera só os próprios eventos.
- Lista de eventos com tags, ordenada por prioridade (longo prazo no topo).
- Em cada evento: Lotado, Encerrar, Reabrir, Remover e o coração de favoritar, tudo gravado no banco.
- Filtro por status (abertos, lotados, encerrados) e busca por título.
- Painel com quatro números calculados pelo banco (`GET /api/estatisticas`, com `GROUP BY`).
- Aviso amarelo quando existe evento de longo prazo ainda aberto.

## Rotas da API

| Rota | O que faz |
| --- | --- |
| `POST /api/usuarios` | cria uma conta |
| `POST /api/login` | devolve o token (válido por 8 h) |
| `GET /api/tarefas?status=&busca=` | lista os eventos de quem está logado |
| `GET /api/tarefas/:id` | um evento (404 se não for seu) |
| `POST /api/tarefas` | cadastra um evento |
| `PATCH /api/tarefas/:id` | altera título, prioridade ou status |
| `PATCH /api/tarefas/:id/status` | muda só o status (concluir e reabrir; 204) |
| `DELETE /api/tarefas/:id` | remove um evento |
| `GET /api/estatisticas` | totais por status |

Todas, exceto cadastro e login, exigem `Authorization: Bearer <token>`.
