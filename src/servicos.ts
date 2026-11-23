
//CRIA A ABA DE CRIAR NOVA TAREFAS

import type { Contagem, NovaTarefa, Prioridade, Status, Tarefa } from "./tipos";

// Gera o próximo id a partir do maior id já existente
function gerarId(lista: Tarefa[]): number {
    let maior = 0;
    for (const tarefa of lista) {
        if (tarefa.id > maior) {
            maior = tarefa.id;
        }
    }
    return maior + 1;
}
// Cadastra uma tarefa: o usuário informa só o essencial
export function adicionarTarefa(lista: Tarefa[], dados: NovaTarefa): Tarefa {
    if (dados.titulo.trim().length < 3) {
        throw new Error("O título precisa ter pelo menos 3 caracteres.");
    }
    const tarefa: Tarefa = {
        ...dados,
        id: gerarId(lista),
        status: "aberto",
        criadaEm: new Date(),
    };
    lista.push(tarefa);
    return tarefa;
}
// A SUA função de alta ordem: recebe uma lista e uma regra
export function transformar<T, R>(lista: T[], regra: (item: T) => R): R[] {
    const resultado: R[] = [];
    for (const item of lista) {
        resultado.push(regra(item));
    }
    return resultado;
}

// ---------- Aula 6: as consultas que rodam no navegador ----------

// ---------- filter e find: selecionar ----------
export function filtrarPorStatus(lista: Tarefa[], status: Status): Tarefa[] {
    return lista.filter((t) => t.status === status);
}

// Pesquisa sem diferenciar maiúsculas de minúsculas
export function pesquisarPorTitulo(lista: Tarefa[], termo: string): Tarefa[] {
    const procurado = termo.trim().toLowerCase();
    return lista.filter((t) => t.titulo.toLowerCase().includes(procurado));
}

// ---------- some e every: perguntas de sim ou não ----------
// No tema do EVENTOS FACUL, "alta pendente" = prioridade longo_prazo (a cor vermelha) ainda aberta
export function existeAltaPendente(lista: Tarefa[]): boolean {
    return lista.some((t) => t.prioridade === "longo_prazo" && t.status === "aberto");
}

export function todasConcluidas(lista: Tarefa[]): boolean {
    return lista.length > 0 && lista.every((t) => t.status === "encerrado");
}

// ---------- reduce: o painel calculado no navegador ----------
export function contarPorStatus(lista: Tarefa[]): Contagem {
    return lista.reduce<Contagem>(
        (acumulador, t) => {
            acumulador[t.status]++;
            return acumulador; // não esqueça este return!
        },
        { aberto: 0, lotado: 0, encerrado: 0 }
    );
}

// ---------- sort: ordenar sem estragar o original ----------
const pesoPrioridade: Record<Prioridade, number> = { longo_prazo: 3, medio_prazo: 2, curto_prazo: 1 };

export function ordenarPorPrioridade(lista: Tarefa[]): Tarefa[] {
    return [...lista].sort(
        (a, b) => pesoPrioridade[b.prioridade] - pesoPrioridade[a.prioridade]
    );
}
