// Tipos de entrada e saída do motor de consolidação. Shape aprovado no desenho
// da slice 02 (ver CONTEXT.md). O motor é puro: estes tipos são todo o contrato.

/** Atividade real capturada, já estruturada pelo mapeador/confirmação. */
export interface AtividadeReal {
  /** 'YYYY-MM-DD' — define a qual semana e dia a atividade pertence. */
  data: string;
  /** Chave em `config.vocabulario`. Nunca uma categoria descartada. */
  categoria: string;
  horas: number;
}

/** Uma linha do relatório, no nível do dia. */
export interface EntradaSemana {
  data: string;
  categoria: string;
  horas: number;
  /** As três fontes de horas: grade fixa (config), atividade real, coringa (motor). */
  origem: 'real' | 'grade' | 'coringa';
}

/**
 * Inconsistência sinalizada pelo motor para revisão humana antes do envio.
 * Dado na saída (consumível pela UI). União discriminada por `tipo`: cada caso
 * carrega o que a UI precisa mostrar. O motor sinaliza, nunca corrige sozinho.
 */
export type FlagSemana =
  /** Semana sem nenhuma atividade real capturada (só grade/coringa). */
  | { tipo: 'sem-atividade-real' }
  /** Semana parcial fechada por proporção — revisar à mão (monitoria). */
  | { tipo: 'parcial-proporcional' }
  /** Horas reais acima do alvo. Só alerta: atividade real fica intacta. */
  | { tipo: 'acima-do-alvo'; alvo: number; real: number }
  /** Coringa saturou (teto/dias) e não fechou o alvo. Quanto faltou. */
  | { tipo: 'carga-incompleta'; faltam: number };

export interface SemanaConsolidada {
  /** 1-based → "I SEMANA", "II SEMANA"... */
  indice: number;
  /** Segunda-feira da semana ('YYYY-MM-DD'); pode cair no mês vizinho. */
  inicio: string;
  /** Domingo da semana ('YYYY-MM-DD'); pode cair no mês vizinho. */
  fim: string;
  entradas: EntradaSemana[];
  /** Carga-alvo da semana: cheia → cargaSemanal; proporcional → ∝ dias no mês. */
  alvoHoras: number;
  /** Soma das entradas. Invariante (sem flag): === alvoHoras. */
  totalHoras: number;
  /** Inconsistências para revisão humana. Vazio = semana limpa. */
  flags: FlagSemana[];
}

export interface Consolidacao {
  /** config.id */
  projeto: string;
  mes: { ano: number; mes: number };
  semanas: SemanaConsolidada[];
}
