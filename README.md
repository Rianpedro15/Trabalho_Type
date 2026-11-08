# type


30/10 - AMANDA ATUALIZOU O CODIGO



## Como rodar (Aula 3: site + API + MySQL)

1. No MySQL Workbench, rode o `eventos.sql` inteiro (raio). Isso cria o banco `eventos_facul`.
2. Abra o arquivo `.env` e troque `DB_SENHA` pela senha do SEU MySQL.
3. No terminal, dentro desta pasta: `npm install`
4. Terminal 1 (API, porta 3000): `npm run api`
5. Terminal 2 (site, porta 5173): `npm run dev` e abra http://localhost:5173
6. Teste a API: http://localhost:3000/api/tarefas e http://localhost:3000/api/tarefas/3
7. Conferir tipos: `npm run verificar`

Nota: a API do TaskFlow do professor e a nossa usam a porta 3000. Rode uma de cada vez.
