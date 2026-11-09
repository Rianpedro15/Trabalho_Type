
//ELE DEFINE O TIPO DE TAREFAS 

<<<<<<< HEAD
export type Prioridade = "curto_prazo" | "medio_prazo" | "longo_prazo";
=======
export type Prioridade = "curto_prazo" | "medio prazo" | "longo prazo";
>>>>>>> ec57773e52ea5cf5cb1121f85a549c9d31aaa5a7
export type Status = "aberto" | "lotado" | "encerrado";

export interface Tarefa {
    readonly id: number;
    titulo: string;
<<<<<<< HEAD
    descricao?: string | null;   // no banco, "sem valor" é NULL
    prioridade: Prioridade;
    status: Status;
    tags: string[];
    dataEvento?: string | null;  // NOVO: "2026-10-22" ou null
=======
    descricao?: string;
    prioridade: Prioridade;
    status: Status;
    tags: string[];
>>>>>>> ec57773e52ea5cf5cb1121f85a549c9d31aaa5a7
    criadaEm: Date;
}

// O que o usuário informa ao cadastrar:
// id, status e criadaEm são responsabilidade do sistema
export type NovaTarefa = Omit<Tarefa, "id" | "status" | "criadaEm">;