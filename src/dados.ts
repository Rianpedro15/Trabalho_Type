
// TABBELA DOS BANCO DE DADOS, CRIA AS PRIMEIRAS TAREFAS DO SITE


import type { Tarefa } from "./tipos";

export const tarefas: Tarefa[] = [
    { 
        id: 1, 
        titulo: "evento 1", 
<<<<<<< HEAD
        prioridade: "longo_prazo", 
=======
        prioridade: "longo prazo", 
>>>>>>> ec57773e52ea5cf5cb1121f85a549c9d31aaa5a7
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
<<<<<<< HEAD
        prioridade: "longo_prazo",
=======
        prioridade: "longo prazo",
>>>>>>> ec57773e52ea5cf5cb1121f85a549c9d31aaa5a7
        status: "lotado", 
        tags: ["trabalho"], 
        criadaEm: new Date() 
    },
    { 
        id: 4, 
        titulo: "Evento 4", 
<<<<<<< HEAD
        prioridade: "medio_prazo", 
=======
        prioridade: "medio prazo", 
>>>>>>> ec57773e52ea5cf5cb1121f85a549c9d31aaa5a7
        status: "aberto",
        tags: ["estudo", "ts"], 
        criadaEm: new Date() 
    },
    { 
        id: 5, 
        titulo: "Evento 5", 
<<<<<<< HEAD
        prioridade: "medio_prazo", 
=======
        prioridade: "medio prazo", 
>>>>>>> ec57773e52ea5cf5cb1121f85a549c9d31aaa5a7
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