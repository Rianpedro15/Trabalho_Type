
// TABELA DOS BANCO DE DADOS, CRIA AS PRIMEIRAS TAREFAS DO SITE


import type { Tarefa } from "./tipos";

export const tarefas: Tarefa[] = [
    { 
        id: 1, 
        titulo: "Semana de Recepção dos Calouros",
        prioridade: "longo_prazo", 
        status: "aberto",
        tags: ["estudo", "ts"], 
        criadaEm: new Date() 
    },
    { 
        id: 2, 
        titulo: "Feira de Profissões e Carreiras",
        prioridade: "curto_prazo", 
        status: "encerrado",
        tags: ["casa"], 
        criadaEm: new Date() 
    },
    { 
        id: 3, 
        titulo: "Congresso de Iniciação Científica",
        descricao: "PR #42", 
        prioridade: "longo_prazo",
        status: "lotado", 
        tags: ["trabalho"], 
        criadaEm: new Date() 
    },
    { 
        id: 4, 
        titulo: "Hackathon Universitário de Tecnologia",
        prioridade: "medio_prazo", 
        status: "aberto",
        tags: ["estudo", "ts"], 
        criadaEm: new Date() 
    },
    { 
        id: 5, 
        titulo: "Jogos Interatléticas da Faculdade",
        prioridade: "medio_prazo", 
        status: "aberto",
        tags: ["saude"], 
        criadaEm: new Date() 
    },
    { 
        id: 6, 
        titulo: "Cerimônia de Formatura e Colação de Grau",
        prioridade: "curto_prazo", 
        status: "aberto",
        tags: ["casa"], 
        criadaEm: new Date() 
    },
];