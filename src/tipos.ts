
//ELE DEFINE O TIPO DE TAREFAS 

export type Prioridade = "curto_prazo" | "medio_prazo" | "longo_prazo";
export type Status = "aberto" | "lotado" | "encerrado";

export interface Tarefa {
    readonly id: number;
    titulo: string;
    descricao?: string | null;   // no banco, "sem valor" é NULL
    prioridade: Prioridade;
    status: Status;
    tags: string[];
    dataEvento?: string | null;  // NOVO: "2026-10-22" ou null
    criadaEm: Date;
}

// O que o usuário informa ao cadastrar:
// id, status e criadaEm são responsabilidade do sistema
export type NovaTarefa = Omit<Tarefa, "id" | "status" | "criadaEm">;