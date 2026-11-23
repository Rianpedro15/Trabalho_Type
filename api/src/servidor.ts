// A API DO EVENTOS FACUL (Express, porta 3000). Fica no meio: a página pede, a API busca no MySQL.

import "dotenv/config"; // primeira linha: carrega o .env antes de tudo
import bcrypt from "bcryptjs";
import express, { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { exigirLogin, SEGREDO, usuarioDe } from "./autenticacao";
import { banco } from "./banco";
import { PRIORIDADES, STATUS, type DadosTarefa, type Prioridade, type Status } from "./tipos";

const app = express();
app.use(express.json());

// Aula 5: cada usuário vê só os SEUS eventos (WHERE usuario_id = ?)

// Devolve a mensagem de erro, ou undefined se estiver tudo certo
function validar(dados: DadosTarefa): string | undefined {
    if (typeof dados.titulo !== "string" || dados.titulo.trim().length < 3) {
        return "O título precisa ter pelo menos 3 caracteres.";
    }
    if (dados.prioridade !== undefined && !PRIORIDADES.includes(dados.prioridade)) {
        return "Prioridade inválida.";
    }
    return undefined;
}

// Aula 6: o SELECT que todas as rotas usam. Os "AS" trocam o nome da coluna
// do jeito do banco (criada_em) para o jeito do TypeScript (criadaEm).
// Agora com as tags: uma subconsulta junta os nomes numa linha só (GROUP_CONCAT)
const SELECT_EVENTOS = `
    SELECT e.id, e.titulo, e.descricao, e.prioridade, e.status, e.favorito,
           DATE_FORMAT(e.data_evento, '%Y-%m-%d') AS dataEvento,
           e.criada_em AS criadaEm,
           (SELECT GROUP_CONCAT(g.nome ORDER BY g.nome SEPARATOR ',')
              FROM evento_tag et
              JOIN tags g ON g.id = et.tag_id
             WHERE et.evento_id = e.id) AS tags
      FROM eventos e`;

// O banco devolve as tags como "estudo,ts" (ou null): viram um array
function paraTarefa(linha: RowDataPacket): RowDataPacket {
    return { ...linha, favorito: Boolean(linha.favorito), tags: linha.tags ? String(linha.tags).split(",") : [] };
}

// Busca um evento de quem está logado: pode não existir (ou ser de outra pessoa)
async function buscarUma(id: number, usuarioId: number): Promise<RowDataPacket | undefined> {
    const [linhas] = await banco.execute<RowDataPacket[]>(
        `${SELECT_EVENTOS} WHERE e.id = ? AND e.usuario_id = ?`,
        [id, usuarioId]
    );
    return linhas[0] ? paraTarefa(linhas[0]) : undefined;
}

// Os eventos de quem está logado, com filtros opcionais na URL:
// /api/tarefas?status=aberto&busca=hack
app.get("/api/tarefas", exigirLogin, async (req, res) => {
    let sql = `${SELECT_EVENTOS} WHERE e.usuario_id = ?`;
    const valores: (string | number)[] = [usuarioDe(res)];

    const { status, busca } = req.query;
    if (typeof status === "string" && STATUS.includes(status as Status)) {
        sql += " AND e.status = ?"; // o filter, no banco
        valores.push(status);
    }
    if (typeof busca === "string" && busca.trim() !== "") {
        sql += " AND e.titulo LIKE ?"; // o includes, no banco
        valores.push(`%${busca.trim()}%`);
    }
    sql += " ORDER BY FIELD(e.prioridade, 'longo_prazo', 'medio_prazo', 'curto_prazo'), e.titulo"; // o sort

    const [linhas] = await banco.execute<RowDataPacket[]>(sql, valores);
    res.json(linhas.map(paraTarefa));
});

// O PAINEL: o GROUP BY faz no banco o que o reduce fazia no navegador
app.get("/api/estatisticas", exigirLogin, async (_req, res) => {
    const [linhas] = await banco.execute<RowDataPacket[]>(
        `SELECT status, COUNT(*) AS quantidade
           FROM eventos
          WHERE usuario_id = ?
          GROUP BY status`,
        [usuarioDe(res)]
    );
    // começa com zeros: o GROUP BY não devolve linha para status sem evento
    const contagem: Record<Status, number> = { aberto: 0, lotado: 0, encerrado: 0 };
    for (const linha of linhas) {
        contagem[linha.status as Status] = Number(linha.quantidade);
    }
    res.json(contagem);
});

// Um evento de quem está logado: pode não existir (ou ser de outra pessoa) -> 404
app.get("/api/tarefas/:id", exigirLogin, async (req, res) => {
    const evento = await buscarUma(Number(req.params.id), usuarioDe(res));
    if (!evento) {
        res.status(404).json({ erro: `Evento #${req.params.id} não encontrado.` });
        return;
    }
    res.json(evento);
});

// Cadastra um evento: o dono vem do token, nunca do corpo do pedido
app.post("/api/tarefas", exigirLogin, async (req, res) => {
    const dados = req.body as DadosTarefa;
    const problema = validar(dados);
    if (problema) {
        res.status(400).json({ erro: problema }); // 400: o pedido veio errado
        return;
    }
    const { titulo, descricao, prioridade, dataEvento, tags } = dados;
    const usuarioId = usuarioDe(res);
    const [resultado] = await banco.execute<ResultSetHeader>(
        "INSERT INTO eventos (usuario_id, titulo, descricao, prioridade, data_evento) VALUES (?, ?, ?, ?, ?)",
        [usuarioId, titulo!.trim(), descricao ?? null, prioridade ?? "medio_prazo", dataEvento ?? null]
    );
    // as tags (se vierem) são gravadas pelo nome, só nas tags deste usuário
    for (const nome of new Set((tags ?? []).map((t) => t.trim()).filter((t) => t !== ""))) {
        await banco.execute(
            "INSERT IGNORE INTO tags (usuario_id, nome) VALUES (?, ?)",
            [usuarioId, nome]
        );
        await banco.execute(
            `INSERT INTO evento_tag (evento_id, tag_id)
             SELECT ?, g.id FROM tags g WHERE g.usuario_id = ? AND g.nome = ?`,
            [resultado.insertId, usuarioId, nome]
        );
    }
    res.status(201).json(await buscarUma(resultado.insertId, usuarioId));
});

// Altera um evento: o AND usuario_id = ? impede mexer no evento de outra pessoa
app.patch("/api/tarefas/:id", exigirLogin, async (req, res) => {
    const { titulo, prioridade, status, favorito } = req.body as {
        titulo?: string;
        prioridade?: Prioridade;
        status?: Status;
        favorito?: boolean;
    };
    const campos: string[] = [];
    const valores: (string | number)[] = [];
    if (titulo !== undefined) {
        if (titulo.trim().length < 3) {
            res.status(400).json({ erro: "O título precisa ter pelo menos 3 caracteres." });
            return;
        }
        campos.push("titulo = ?");
        valores.push(titulo.trim());
    }
    if (prioridade !== undefined) {
        if (!PRIORIDADES.includes(prioridade)) {
            res.status(400).json({ erro: "Prioridade inválida." });
            return;
        }
        campos.push("prioridade = ?");
        valores.push(prioridade);
    }
    if (status !== undefined) {
        if (!STATUS.includes(status as Status)) {
            res.status(400).json({ erro: "Status inválido." });
            return;
        }
        campos.push("status = ?");
        valores.push(status);
        campos.push(status === "encerrado" ? "encerrada_em = NOW()" : "encerrada_em = NULL");
    }
    if (favorito !== undefined) {
        campos.push("favorito = ?");
        valores.push(favorito ? 1 : 0);
    }
    if (campos.length === 0) {
        res.status(400).json({ erro: "Nada para alterar." });
        return;
    }
    const id = Number(req.params.id);
    const usuarioId = usuarioDe(res);
    const [resultado] = await banco.execute<ResultSetHeader>(
        `UPDATE eventos SET ${campos.join(", ")} WHERE id = ? AND usuario_id = ?`,
        [...valores, id, usuarioId]
    );
    if (resultado.affectedRows === 0) {
        res.status(404).json({ erro: `Evento #${req.params.id} não encontrado.` });
        return;
    }
    res.json(await buscarUma(id, usuarioId));
});

// ATUALIZAR só o status (Aula 4): 204 quando dá certo, sem conteúdo
app.patch("/api/tarefas/:id/status", exigirLogin, async (req, res) => {
    const { status } = req.body as { status?: Status };
    if (!status || !STATUS.includes(status)) {
        res.status(400).json({ erro: "Status inválido." });
        return;
    }
    const [resultado] = await banco.execute<ResultSetHeader>(
        `UPDATE eventos
            SET status = ?, encerrada_em = IF(? = 'encerrado', NOW(), NULL)
          WHERE id = ? AND usuario_id = ?`,
        [status, status, Number(req.params.id), usuarioDe(res)]
    );
    if (resultado.affectedRows === 0) {
        res.status(404).json({ erro: `Evento #${req.params.id} não encontrado.` });
        return;
    }
    res.status(204).end(); // 204: deu certo, e não há nada para devolver
});

// Remove um evento: com [id, outro usuário], nenhuma linha atende -> 404
app.delete("/api/tarefas/:id", exigirLogin, async (req, res) => {
    const [resultado] = await banco.execute<ResultSetHeader>(
        "DELETE FROM eventos WHERE id = ? AND usuario_id = ?",
        [Number(req.params.id), usuarioDe(res)]
    );
    if (resultado.affectedRows === 0) {
        res.status(404).json({ erro: `Evento #${req.params.id} não encontrado.` });
        return;
    }
    res.status(204).end();
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


// ---------- ERROS NÃO PREVISTOS: sempre depois de todas as rotas ----------
app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(erro); // o detalhe técnico fica só no terminal
    res.status(500).json({ erro: "Algo deu errado no servidor. Tente de novo." });
});

app.listen(3000, () => console.log("API do EVENTOS FACUL em http://localhost:3000"));
