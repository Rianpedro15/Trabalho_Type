
// TABBELA DOS BANCO DE DADOS, CRIA AS PRIMEIRAS TAREFAS DO SITE


import type { Tarefa } from "./tipos";

export const tarefas: Tarefa[] = [
    { 
        id: 1, 
        titulo: "evento 1", 
        prioridade: "longo_prazo", 
        status: "aberto",
        tags: ["estudo", "ts"], 
        criadaEm: new Date() 
    },
    { 
        id: 2, 
        titulo: "Evento 2", 
        prioridade: "curto_prazo", 
        status: "encerrado",
        tags: ["casa"], 
        criadaEm: new Date() 
    },
    { 
        id: 3, 
        titulo: "Evento 3", 
        descricao: "PR #42", 
        prioridade: "longo_prazo",
        status: "lotado", 
        tags: ["trabalho"], 
        criadaEm: new Date() 
    },
    { 
        id: 4, 
        titulo: "Evento 4", 
        prioridade: "medio_prazo", 
        status: "aberto",
        tags: ["estudo", "ts"], 
        criadaEm: new Date() 
    },
    { 
        id: 5, 
        titulo: "Evento 5", 
        prioridade: "medio_prazo", 
        status: "aberto",
        tags: ["saude"], 
        criadaEm: new Date() 
    },
    { 
        id: 6, 
        titulo: "Evento 6", 
        prioridade: "curto_prazo", 
        status: "aberto",
        tags: ["casa"], 
        criadaEm: new Date() 
    },
];