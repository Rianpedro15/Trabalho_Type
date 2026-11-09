# type


30/10 - AMANDA ATUALIZOU O CODIGO



## Como rodar (Aula 3: site + API + MySQL)

1. No MySQL Workbench, rode o `eventos.sql` inteiro (raio). Isso cria o banco `eventos_facul`.
2. Na pasta `api`, copie `.env.exemplo` para `.env` e preencha `DB_SENHA` com a senha do SEU MySQL.
3. Terminal 1, na pasta `api` (porta 3000): `npm install` e depois `npm run dev`
4. Terminal 2, na pasta do site (porta 5173): `npm install` e depois `npm run dev`. Abra http://localhost:5173
5. Teste a API: http://localhost:3000/api/tarefas e http://localhost:3000/api/tarefas/3
6. Conferir tipos: `npm run verificar` (nas duas pastas)

Nota: a API do TaskFlow do professor e a nossa usam a porta 3000. Rode uma de cada vez.
