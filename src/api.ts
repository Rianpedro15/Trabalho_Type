// TODAS AS CONVERSAS COM A API FICAM AQUI

import type { Tarefa } from "./tipos";

// Todos os eventos que estão no banco
export async function listarTarefas(): Promise<Tarefa[]> {
    let resposta: Response;
    try {
        resposta = await fetch("/api/tarefas");
    } catch {
        throw new Error("Não foi possível conectar à API. Ela está rodando? (npm run dev na pasta api)");
    }
    if (!resposta.ok) {
        throw new Error("Não foi possível carregar os eventos. A API está rodando?");
    }
    const bruto = (await resposta.json()) as Tarefa[];
    // JSON não tem data: criadaEm chega como texto e precisa virar Date
    return bruto.map((t) => ({ ...t, criadaEm: new Date(t.criadaEm) }));
}

// Um evento: devolve undefined se ele não existir (o mesmo padrão do find)
export async function buscarTarefa(id: number): Promise<Tarefa | undefined> {
    const resposta = await fetch(`/api/tarefas/${id}`);
    if (resposta.status === 404) {
        return undefined;
    }
    if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status} ao buscar o evento #${id}.`);
    }
    const bruto = (await resposta.json()) as Tarefa;
    return { ...bruto, criadaEm: new Date(bruto.criadaEm) };
}
