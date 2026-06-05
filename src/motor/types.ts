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

export interface SemanaConsolidada {
  /** 1-based → "I SEMANA", "II SEMANA"... */
  indice: number;
  /** Segunda-feira da semana ('YYYY-MM-DD'); pode cair no mês vizinho. */
  inicio: string;
  /** Domingo da semana ('YYYY-MM-DD'); pode cair no mês vizinho. */
  fim: string;
  entradas: EntradaSemana[];
  /** Invariante (semana cheia): === config.cargaSemanal. */
  totalHoras: number;
}

export interface Consolidacao {
  /** config.id */
  projeto: string;
  mes: { ano: number; mes: number };
  semanas: SemanaConsolidada[];
}
