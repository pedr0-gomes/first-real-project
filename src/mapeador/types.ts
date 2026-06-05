// Contrato do mapeador semântico (slice 05). É a fronteira LLM × código, fechada:
// o LLM faz só NL→structured; toda regra (default de horas, descarte, rejeição de
// categoria fora do vocabulário) é da nossa lógica em volta, testada com mock.

/**
 * Único ponto de LLM do produto, injetável. Recebe o prompt pronto e devolve o
 * texto bruto (JSON) da resposta. O parsing e a validação são nossos, não dele.
 * O adaptador real (Claude/OpenAI) é um one-liner que implementa esta assinatura.
 */
export type ClienteLLM = (prompt: string) => Promise<string>;

/** De onde vieram as horas de uma atividade extraída. */
export type FonteHoras = 'texto' | 'default';

/** Atividade reconhecida no texto, já validada contra o vocabulário oficial. */
export interface AtividadeExtraida {
  /** Chave em `config.vocabulario`, sempre uma categoria ativa (nunca descartada). */
  categoria: string;
  horas: number;
  /** 'texto' = o LLM extraiu do texto; 'default' = caiu no fallback da config. */
  fonteHoras: FonteHoras;
}

/** Categoria reconhecida mas descartada (ex: Instagram na LoOBI) — pra UI avisar. */
export interface CategoriaDescartada {
  categoria: string;
}

export interface ResultadoMapeamento {
  atividades: AtividadeExtraida[];
  descartes: CategoriaDescartada[];
}
