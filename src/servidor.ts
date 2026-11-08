// A API DO EVENTOS FACUL (Express, porta 3000). Fica no meio: a página pede, a API busca no MySQL.

import "dotenv/config"; // primeira linha: carrega o .env antes de tudo
import express from "express";
import type { RowDataPacket } from "mysql2";
import { banco } from "./banco";

const app = express();
app.use(express.json());

// Aula 3: a lista mostra os eventos de TODOS os usuários

// O SELECT que as duas rotas usam. Os "AS" trocam o nome da coluna
// do jeito do banco (criada_em) para o jeito do TypeScript (criadaEm).
const SELECT_EVENTOS = `
    SELECT id, titulo, descricao, prioridade, status,
           DATE_FORMAT(data_evento, '%Y-%m-%d') AS dataEvento,
           criada_em AS criadaEm
      FROM eventos`;

// Todos os eventos
app.get("/api/tarefas", async (_req, res) => {
    const [linhas] = await banco.execute<RowDataPacket[]>(
        `${SELECT_EVENTOS} ORDER BY id`,
        [] // sem filtro: nenhum ? nesta consulta
    );
    // as tags chegam na Aula 6; por enquanto, uma lista vazia em cada evento
    res.json(linhas.map((linha) => ({ ...linha, tags: [] })));
});

// Um evento: pode não existir!
app.get("/api/tarefas/:id", async (req, res) => {
    const [linhas] = await banco.execute<RowDataPacket[]>(
        `${SELECT_EVENTOS} WHERE id = ?`,
        [Number(req.params.id)]
    );
    if (linhas.length === 0) {
        res.status(404).json({ erro: `Evento #${req.params.id} não encontrado.` });
        return;
    }
    res.json({ ...linhas[0], tags: [] });
});

app.listen(3000, () => console.log("API do EVENTOS FACUL em http://localhost:3000"));
