// A API DO EVENTOS FACUL (Express, porta 3000). Fica no meio: a página pede, a API busca no MySQL.

import "dotenv/config"; // primeira linha: carrega o .env antes de tudo
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { exigirLogin, SEGREDO, usuarioDe } from "./autenticacao";
import { banco } from "./banco";

const app = express();
app.use(express.json());

// Aula 5: cada usuário vê só os SEUS eventos (WHERE usuario_id = ?)

// O SELECT que as duas rotas usam. Os "AS" trocam o nome da coluna
// do jeito do banco (criada_em) para o jeito do TypeScript (criadaEm).
const SELECT_EVENTOS = `
    SELECT id, titulo, descricao, prioridade, status,
           DATE_FORMAT(data_evento, '%Y-%m-%d') AS dataEvento,
           criada_em AS criadaEm
      FROM eventos`;

// Todos os eventos
// Os eventos de quem está logado
app.get("/api/tarefas", exigirLogin, async (_req, res) => {
    const [linhas] = await banco.execute<RowDataPacket[]>(
        `${SELECT_EVENTOS} WHERE usuario_id = ? ORDER BY id`,
        [usuarioDe(res)]
    );
    // as tags chegam na Aula 6; por enquanto, uma lista vazia em cada evento
    res.json(linhas.map((linha) => ({ ...linha, tags: [] })));
});

// Um evento de quem está logado: pode não existir (ou ser de outra pessoa) -> 404
app.get("/api/tarefas/:id", exigirLogin, async (req, res) => {
    const [linhas] = await banco.execute<RowDataPacket[]>(
        `${SELECT_EVENTOS} WHERE id = ? AND usuario_id = ?`,
        [Number(req.params.id), usuarioDe(res)]
    );
    if (linhas.length === 0) {
        res.status(404).json({ erro: `Evento #${req.params.id} não encontrado.` });
        return;
    }
    res.json({ ...linhas[0], tags: [] });
});
// ---------- USUÁRIOS (Aula 5) ----------
app.post("/api/usuarios", async (req, res) => {
    const { nome, email, senha } = req.body as { nome?: string; email?: string; senha?: string };
    if (!nome?.trim() || !email?.includes("@") || !senha || senha.length < 6) {
        res.status(400).json({
            erro: "Preencha nome, e-mail válido e senha de 6 caracteres ou mais.",
        });
        return;
    }
    const hash = await bcrypt.hash(senha, 10); // a senha nunca vai para o banco
    try {
        const [resultado] = await banco.execute<ResultSetHeader>(
            "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
            [nome.trim(), email.trim().toLowerCase(), hash]
        );
        res.status(201).json({ id: resultado.insertId });
    } catch (erro) {
        // quem descobre o e-mail repetido é o UNIQUE do banco
        if ((erro as { code?: string }).code === "ER_DUP_ENTRY") {
            res.status(409).json({ erro: "Este e-mail já está cadastrado." });
            return;
        }
        throw erro;
    }
});

app.post("/api/login", async (req, res) => {
    const { email, senha } = req.body as { email?: string; senha?: string };
    const [linhas] = await banco.execute<RowDataPacket[]>(
        "SELECT id, nome, senha_hash FROM usuarios WHERE email = ?",
        [email?.trim().toLowerCase() ?? ""]
    );
    const usuario = linhas[0];
    if (!usuario || !senha || !(await bcrypt.compare(senha, usuario.senha_hash))) {
        // a mesma mensagem nos dois casos: não contamos qual dos dois errou
        res.status(401).json({ erro: "E-mail ou senha inválidos." });
        return;
    }
    const token = jwt.sign({ id: usuario.id }, SEGREDO, { expiresIn: "8h" });
    res.json({ token, nome: usuario.nome });
});


app.listen(3000, () => console.log("API do EVENTOS FACUL em http://localhost:3000"));
