// Shape estático que descreve um projeto (vínculo). Motor, formatador e mapeador
// consomem este tipo — projeto novo no futuro = escrever mais uma config, não
// tocar no motor. Shape fechado no grill-me (ver CONTEXT.md).

/** Dia da semana. A semana do relatório vai de segunda a domingo. */
export type DiaDaSemana = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

/**
 * Como o motor fecha a carga numa semana parcial (início/fim de mês):
 * - `cheia`: fecha a carga semanal inteira mesmo com poucos dias (LoOBI).
 * - `proporcional`: carga ∝ dias úteis no mês, com flag de revisão (monitoria).
 */
export type EstrategiaSemanaParcial = 'cheia' | 'proporcional';

/**
 * Uma categoria do vocabulário oficial de um projeto.
 *
 * União discriminada por `descartada`: categoria ativa exige a `descricaoOficial`
 * que vai literal no relatório; categoria descartada (ex: Instagram na LoOBI) não
 * tem saída — é reconhecida na captura para não virar "Outros", o motor compensa
 * as horas com o coringa.
 */
export type CategoriaVocabulario =
  | { descartada?: false; descricaoOficial: string }
  | { descartada: true };

/** Item fixo e recorrente da semana (ex: plantão toda terça). */
export interface ItemGrade {
  dia: DiaDaSemana;
  /** Chave correspondente em `vocabulario`. */
  categoria: string;
  horas: number;
}

export interface ProjetoConfig {
  /** Chave estável do projeto. Vira `project_id` na persistência. */
  id: string;
  /** Nome legível, usado no título do relatório. */
  nome: string;
  /** Carga semanal obrigatória, em horas. */
  cargaSemanal: number;
  /** Vocabulário oficial, indexado pelo nome da categoria. */
  vocabulario: Record<string, CategoriaVocabulario>;
  /** Itens fixos recorrentes. Cobre só o realmente fixo (folga proposital). */
  gradeSemanal: ItemGrade[];
  /** Fallback de horas por categoria quando o texto livre não as informa. */
  defaultHorasPorCategoria: Record<string, number>;
  /** Descrição oficial do preenchimento-coringa que fecha a carga. */
  atividadeCoringa: string;
  semanaParcial: EstrategiaSemanaParcial;
  /** Teto soft de horas/dia para o coringa — guia, nunca bloqueia atividade real. */
  tetoHorasDiaCoringa: number;
  /** Se o coringa pode cair em sábado/domingo. Atividade real não é restrita por isto. */
  aceitaFimDeSemana: boolean;
}
