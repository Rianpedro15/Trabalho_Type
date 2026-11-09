import { elemento, campo, selecao } from "./dom"; //importa os campos criados no DOM

import { buscarTarefa, listarTarefas } from "./api"; //conversa com a API (que busca no MySQL)

import type { Prioridade, Tarefa } from "./tipos"; //importa o tipo da tarefa (prioridade, status)

import { adicionarTarefa } from "./servicos"; //o usuario add uma nova tarefa



elemento("nome-do-sistema").textContent = "EVENTOS FACUL";
elemento("versao").textContent = "v0.3.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");
// Começa vazia: quem preenche é a API (por isso é let, não const)
let lista: Tarefa[] = [];
// Uma tarefa vira um <li> pronto para a tela
function criarItem(tarefa: Tarefa): HTMLLIElement {
    const item = document.createElement("li");
    item.className = `tarefa tarefa--${tarefa.prioridade}`;

    const titulo = document.createElement("h3");
    titulo.className = "tarefa__titulo";
    titulo.textContent = `#${tarefa.id} ${tarefa.titulo}`;

    const meta = document.createElement("div");
    meta.className = "tarefa__meta";

    const etiqueta = document.createElement("span");
    etiqueta.className = `etiqueta etiqueta--${tarefa.prioridade}`;
    etiqueta.textContent = tarefa.prioridade;


    // map de novo: cada tag vira um <span>
    const tags = tarefa.tags.map((tag) => {
        const elementoTag = document.createElement("span");
        elementoTag.className = "tag";
        elementoTag.textContent = tag;
        return elementoTag;
    });

    meta.append(etiqueta, ...tags);
    item.append(titulo, meta);
    return item;
}
// A função que desenha a tela inteira a partir da lista
function desenhar(): void {
    // map: transforma cada evento num <li>
    elemento("lista").replaceChildren(...lista.map(criarItem));

    // filter: só os que passam no teste
    const abertos = lista.filter((t) => t.status === "aberto");
    elemento("total").textContent = String(lista.length);
    elemento("abertos").textContent = String(abertos.length);
}
// O formulário: a função abaixo é um CALLBACK — quem a chama é o navegador
// O cadastro ainda grava só na tela. Na Aula 4 ele vai para o banco.
elemento("formulario").addEventListener("submit", (evento) => {
    evento.preventDefault(); // sem isto, a página recarrega e tudo se perde
    elemento("erro").textContent = "";
    try {
        adicionarTarefa(lista, {
            titulo: campo("titulo").value.trim(),
            prioridade: selecao("prioridade").value as Prioridade,
            tags: [],
        });
        campo("titulo").value = "";
        desenhar(); // mudou a lista? desenhe de novo
    } catch (erro) {
        if (erro instanceof Error) {
            elemento("erro").textContent = erro.message;
        }
    }
});

// Prata: busca UM evento no banco pelo id e mostra o título no console
async function mostrarTarefa(id: number): Promise<void> {
    const procurada = await buscarTarefa(id); // find no banco: pode não encontrar
    if (procurada) {
        console.log(`Encontrado: ${procurada.titulo}`);
    } else {
        console.log("Evento não encontrado.");
    }
}

// O começo do programa: busca no banco, depois desenha
async function iniciar(): Promise<void> {
    try {
        lista = await listarTarefas();
        desenhar();
        await mostrarTarefa(3);
    } catch (erro) {
        // Ouro: o aviso aparece na tela, não só no console
        if (erro instanceof Error) {
            elemento("erro").textContent = erro.message;
        }
    }
}

iniciar();
