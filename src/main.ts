
import { elemento, campo, selecao } from "./dom"; // importa os campos criados no DOM

import { buscarTarefa, criarConta, encerrarSessao, entrar, guardarSessao, listarTarefas, sessaoAtual } from "./api"; // conversa com a API (que busca no MySQL)

import type { Prioridade, Tarefa } from "./tipos"; // importa o tipo da tarefa

import { adicionarTarefa } from "./servicos"; // o usuário adiciona uma nova tarefa

elemento("nome-do-sistema").textContent = "EVENTOS FACUL";
elemento("versao").textContent = "v0.3.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");

// Começa vazia: quem preenche é a API
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

    // Cada tag vira um <span>
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

// Desenha a tela inteira a partir da lista
function desenhar(): void {
    elemento("lista").replaceChildren(...lista.map(criarItem));

    const abertos = lista.filter((t) => t.status === "aberto");

    elemento("total").textContent = String(lista.length);
    elemento("abertos").textContent = String(abertos.length);
}

// Formulário de cadastro
elemento("formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();
    elemento("erro").textContent = "";

    try {
        adicionarTarefa(lista, {
            titulo: campo("titulo").value.trim(),
            prioridade: selecao("prioridade").value as Prioridade,
            tags: [],
        });

        campo("titulo").value = "";
        desenhar();

    } catch (erro) {
        if (erro instanceof Error) {
            elemento("erro").textContent = erro.message;
        }
    }
});

// Busca um evento no banco pelo ID
async function mostrarTarefa(id: number): Promise<void> {
    const procurada = await buscarTarefa(id);

    if (procurada) {
        console.log(`Encontrado: ${procurada.titulo}`);
    } else {
        console.log("Evento não encontrado.");
    }
}

// ---------- A tela de entrada (Aula 5) ----------
function mostrarErroEntrada(erro: unknown): void {
    const mensagem = erro instanceof Error ? erro.message : "Erro inesperado.";
    elemento("erro-entrada").textContent = mensagem;
}

// Troca entre "Entrar" e "Criar conta"
function mostrarFormulario(criando: boolean): void {
    elemento("form-criar").hidden = !criando;
    elemento("form-entrar").hidden = criando;
    elemento("alternar-entrada").textContent = criando
        ? "Já tenho conta"
        : "Ainda não tenho conta";
    elemento("erro-entrada").textContent = "";
}

elemento("alternar-entrada").addEventListener("click", () => {
    mostrarFormulario(elemento("form-criar").hidden === true); // escondido? então mostra
});

elemento("form-entrar").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    try {
        guardarSessao(await entrar(campo("entrar-email").value, campo("entrar-senha").value));
        campo("entrar-senha").value = "";
        await iniciar();
    } catch (erro) {
        mostrarErroEntrada(erro);
    }
});

elemento("form-criar").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const email = campo("criar-email").value;
    const senha = campo("criar-senha").value;
    try {
        await criarConta(campo("criar-nome").value, email, senha);
        guardarSessao(await entrar(email, senha)); // criou? já entra direto
        (elemento("form-criar") as HTMLFormElement).reset(); // não deixa a senha no campo
        await iniciar();
    } catch (erro) {
        mostrarErroEntrada(erro);
    }
});

elemento("botao-sair").addEventListener("click", () => {
    encerrarSessao();
    lista = [];
    (elemento("form-entrar") as HTMLFormElement).reset();
    mostrarFormulario(false); // volta sempre para "Entrar"
    void iniciar();
});

// ---------- O começo: com sessão, mostra o sistema; sem, a entrada ----------
async function iniciar(): Promise<void> {
    const sessao = sessaoAtual();
    elemento("tela-entrada").hidden = sessao !== undefined;
    elemento("tela-app").hidden = sessao === undefined;
    elemento("botao-sair").hidden = sessao === undefined;
    elemento("usuario-nome").textContent = sessao?.nome ?? "";
    if (!sessao) {
        return;
    }
    elemento("erro-entrada").textContent = "";
    try {
        lista = await listarTarefas();
        desenhar();
        await mostrarTarefa(3);
    } catch (erro) {
        if (erro instanceof Error) {
            elemento("erro").textContent = erro.message;
        }
    }
}

void iniciar();
