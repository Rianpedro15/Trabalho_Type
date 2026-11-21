// TODAS AS CONVERSAS COM A API FICAM AQUI

import type { Sessao, Tarefa } from "./tipos";
const CHAVE_SESSAO = "taskflow:sessao";

// ---------- A sessão: o "crachá" guardado no navegador ----------
export function sessaoAtual(): Sessao | undefined {
    const texto = localStorage.getItem(CHAVE_SESSAO);
    return texto ? (JSON.parse(texto) as Sessao) : undefined;
}

export function guardarSessao(sessao: Sessao): void {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

export function encerrarSessao(): void {
    localStorage.removeItem(CHAVE_SESSAO);
}

// Um erro que guarda também o código HTTP (404, 409...)
class ErroApi extends Error {
    constructor(mensagem: string, readonly status: number) {
        super(mensagem);
    }
}

// A ajudante que mostra o crachá em todo pedido
async function enviar(metodo: string, url: string, corpo?: unknown): Promise<Response> {
    const sessao = sessaoAtual();
    let resposta: Response;
    try {
        resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                ...(sessao ? { Authorization: `Bearer ${sessao.token}` } : {}),
            },
            body: corpo === undefined ? undefined : JSON.stringify(corpo),
        });
    } catch {
        throw new Error("Não foi possível conectar à API. Ela está rodando? (npm run dev na pasta api)");
    }
    // crachá vencido ou inválido: volta para a tela de entrada
    if (resposta.status === 401 && sessao) {
        encerrarSessao();
        location.reload();
    }
    if (!resposta.ok) {
        // a API manda { erro: "..." }; se não mandar, usamos o código
        const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };
        // 502/504: o Vite não achou a API na porta 3000: ela não está rodando
        const semApi = resposta.status === 502 || resposta.status === 504;
        throw new ErroApi(dados.erro ?? (semApi
            ? "A API não respondeu. Rode npm run dev na pasta api."
            : `Erro ${resposta.status}`), resposta.status);
    }
    return resposta;
}


// Todos os eventos que estão no banco
export async function listarTarefas(): Promise<Tarefa[]> {
    const resposta = await enviar("GET", "/api/tarefas");
    const bruto = (await resposta.json()) as Tarefa[];
    // JSON não tem data: criadaEm chega como texto e precisa virar Date
    return bruto.map((t) => ({ ...t, criadaEm: new Date(t.criadaEm) }));
}

// Um evento: devolve undefined se ele não existir (o mesmo padrão do find)
export async function buscarTarefa(id: number): Promise<Tarefa | undefined> {
    try {
        const resposta = await enviar("GET", `/api/tarefas/${id}`);
        const bruto = (await resposta.json()) as Tarefa;
        return { ...bruto, criadaEm: new Date(bruto.criadaEm) };
    } catch (erro) {
        if (erro instanceof ErroApi && erro.status === 404) {
            return undefined;
        }
        throw erro;
    }
}
// ---------- Usuários (Aula 5) ----------
export async function entrar(email: string, senha: string): Promise<Sessao> {
    const resposta = await enviar("POST", "/api/login", { email, senha });
    return (await resposta.json()) as Sessao;
}

export async function criarConta(nome: string, email: string, senha: string): Promise<void> {
    await enviar("POST", "/api/usuarios", { nome, email, senha });
}
