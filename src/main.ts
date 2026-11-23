
import { elemento, campo, selecao } from "./dom"; // importa os campos criados no DOM

import { alterarStatus, alternarFavorito, buscarEstatisticas, buscarTarefa, criarConta, criarTarefa, removerTarefa, encerrarSessao, entrar, guardarSessao, listarTarefas, sessaoAtual } from "./api"; // conversa com a API (que busca no MySQL)

import type { Prioridade, Status, Tarefa } from "./tipos"; // importa o tipo da tarefa

// as consultas que rodam no navegador (Aula 6)
import { existeAltaPendente, filtrarPorStatus, ordenarPorPrioridade, pesquisarPorTitulo, todasConcluidas } from "./servicos";

elemento("nome-do-sistema").textContent = "EVENTOS FACUL";
elemento("versao").textContent = "v0.3.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");

// Começa vazia: quem preenche é a API
let lista: Tarefa[] = [];

// Aula 6: o filtro e a busca mudam o que é MOSTRADO, nunca a lista que existe
let statusSelecionado: Status | "todos" = "todos";
let termoDeBusca = "";

// Uma ajudante para criar botões sem repetir código
function botao(texto: string, extra: string, aoClicar: () => void): HTMLButtonElement {
    const elementoBotao = document.createElement("button");
    elementoBotao.type = "button";
    elementoBotao.className = `botao botao--pequeno ${extra}`;
    elementoBotao.textContent = texto;
    elementoBotao.addEventListener("click", aoClicar); // callback, de novo
    return elementoBotao;
}

// Uma tarefa vira um <li> pronto para a tela
function criarItem(tarefa: Tarefa): HTMLLIElement {
    const item = document.createElement("li");
    item.className = `tarefa tarefa--${tarefa.prioridade}`;
    if (tarefa.status === "encerrado") {
        item.classList.add("tarefa--concluida");
    }

    const principal = document.createElement("div");
    principal.className = "tarefa__principal";

    const titulo = document.createElement("h3");
    titulo.className = "tarefa__titulo";
    titulo.textContent = `#${tarefa.id} ${tarefa.titulo}`;

    const meta = document.createElement("div");
    meta.className = "tarefa__meta";

    const etiqueta = document.createElement("span");
    etiqueta.className = `etiqueta etiqueta--${tarefa.prioridade}`;
    etiqueta.textContent = tarefa.prioridade;

    const situacao = document.createElement("span");
    situacao.className = "etiqueta etiqueta--status";
    situacao.textContent = tarefa.status;

    // Cada tag vira um <span>
    const tags = tarefa.tags.map((tag) => {
        const elementoTag = document.createElement("span");
        elementoTag.className = "tag";
        elementoTag.textContent = tag;
        return elementoTag;
    });

    meta.append(etiqueta, situacao, ...tags);
    principal.append(titulo, meta);

    // O coração: favorita e desfavorita (grava no banco)
    const favorito = document.createElement("button");
    favorito.type = "button";
    favorito.className = "favorito";
    favorito.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    const marcar = (ligado: boolean): void => {
        favorito.classList.toggle("favorito--ativo", ligado);
        favorito.setAttribute("aria-pressed", String(ligado));
        const texto = ligado ? "Remover dos favoritos" : "Favoritar evento";
        favorito.setAttribute("aria-label", texto);
        favorito.title = texto;
    };
    marcar(tarefa.favorito === true);
    favorito.addEventListener("click", async () => {
        const novo = tarefa.favorito !== true;
        tarefa.favorito = novo;
        marcar(novo); // muda na hora; se a API falhar, desfaz
        try {
            await alternarFavorito(tarefa.id, novo);
        } catch (erro) {
            tarefa.favorito = !novo;
            marcar(!novo);
            mostrarErro(erro);
        }
    });

    // Os botões: cada um fecha sobre a SUA tarefa
    const acoes = document.createElement("div");
    acoes.className = "tarefa__acoes";
    acoes.append(favorito);
    if (tarefa.status !== "encerrado") {
        acoes.append(
            botao("Lotado", "", () => mudarStatus(tarefa.id, "lotado")),
            botao("Encerrar", "botao--sucesso", () => mudarStatus(tarefa.id, "encerrado"))
        );
    } else {
        acoes.append(botao("Reabrir", "", () => mudarStatus(tarefa.id, "aberto")));
    }
    acoes.append(botao("Remover", "botao--perigo", () => remover(tarefa.id)));

    item.append(principal, acoes);
    return item;
}

// O par que você vai repetir a noite toda:
// 1. o banco confirma  2. o estado muda sem ser alterado  3. a tela acompanha
async function mudarStatus(id: number, status: Status): Promise<void> {
    try {
        await alterarStatus(id, status);
        lista = lista.map((t) => (t.id === id ? { ...t, status } : t));
        desenhar();
    } catch (erro) {
        mostrarErro(erro);
    }
}

async function remover(id: number): Promise<void> {
    try {
        await removerTarefa(id);
        lista = lista.filter((t) => t.id !== id);
        desenhar();
    } catch (erro) {
        mostrarErro(erro);
    }
}

// Quais eventos mostrar: filtrar, pesquisar, ordenar.
// O filtro muda o que é MOSTRADO, nunca a lista que existe.
function tarefasVisiveis(): Tarefa[] {
    let resultado = lista;
    if (statusSelecionado !== "todos") {
        resultado = filtrarPorStatus(resultado, statusSelecionado);
    }
    if (termoDeBusca.trim() !== "") {
        resultado = pesquisarPorTitulo(resultado, termoDeBusca);
    }
    return ordenarPorPrioridade(resultado);
}

// O painel vem pronto do banco (GROUP BY)
async function atualizarPainel(): Promise<void> {
    const contagem = await buscarEstatisticas();
    const total = contagem.aberto + contagem.lotado + contagem.encerrado;
    elemento("total").textContent = String(total);
    elemento("abertos").textContent = String(contagem.aberto);
    elemento("lotados").textContent = String(contagem.lotado);
    elemento("encerrados").textContent = String(contagem.encerrado);
}

// Desenha a tela inteira a partir da lista
function desenhar(): void {
    const visiveis = tarefasVisiveis();
    elemento("lista").replaceChildren(...visiveis.map(criarItem));
    elemento("vazio").hidden = visiveis.length > 0;

    // some: existe pelo menos um evento de longo prazo ainda aberto?
    elemento("aviso-urgente").classList.toggle("aviso--oculto", !existeAltaPendente(lista));

    // every: todos encerrados?
    if (todasConcluidas(lista)) {
        console.log("Parabéns: nenhum evento em aberto!");
    }
    atualizarPainel().catch(mostrarErro);
}

// Os botões de filtro: um só "ouvinte" para o grupo inteiro
elemento("filtros-status").addEventListener("click", (evento) => {
    const alvo = evento.target;
    if (!(alvo instanceof HTMLButtonElement)) return;
    const escolhido = alvo.dataset.status;
    if (!escolhido) return;

    statusSelecionado = escolhido as Status | "todos";
    for (const b of elemento("filtros-status").querySelectorAll("button")) {
        b.classList.toggle("filtro--ativo", b === alvo);
    }
    desenhar();
});

// A busca filtra enquanto o usuário digita
campo("busca").addEventListener("input", () => {
    termoDeBusca = campo("busca").value;
    desenhar();
});

function mostrarErro(erro: unknown): void {
    if (erro instanceof Error) {
        elemento("erro").textContent = erro.message;
    }
}

// Formulário de cadastro
elemento("formulario").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    elemento("erro").textContent = "";

    try {
        // o evento é gravado no banco, no nome de quem está logado
        const nova = await criarTarefa({
            titulo: campo("titulo").value.trim(),
            prioridade: selecao("prioridade").value as Prioridade,
            tags: [],
        });
        lista = [...lista, nova]; // acrescentar sem alterar: uma lista nova

        campo("titulo").value = "";
        desenhar();

    } catch (erro) {
        mostrarErro(erro);
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
        mostrarErro(erro);
    }
}

void iniciar();
