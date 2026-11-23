// Os mesmos tipos do front, e as listas de valores válidos (a API confere antes de usar)
export type Prioridade = "curto_prazo" | "medio_prazo" | "longo_prazo";
export type Status = "aberto" | "lotado" | "encerrado";

export const PRIORIDADES: Prioridade[] = ["curto_prazo", "medio_prazo", "longo_prazo"];
export const STATUS: Status[] = ["aberto", "lotado", "encerrado"];

// O que chega no POST. Tudo é opcional porque quem manda é o navegador:
// a API confere antes de usar.
export interface DadosTarefa {
    titulo?: string;
    descricao?: string | null;
    prioridade?: Prioridade;
    dataEvento?: string | null;
    tags?: string[];
}
