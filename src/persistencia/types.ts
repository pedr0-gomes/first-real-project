import type { AtividadeReal } from '@/motor/types'

/** Linha crua da tabela `atividades` (snake_case do Postgres). */
export interface LinhaAtividade {
  id: string
  user_id: string
  project_id: string
  date: string
  raw_text: string | null
  mapped_activity: string | null
  category: string
  hours: number
  created_at: string
}

/**
 * Atividade real persistida, no vocabulário do domínio. Estende AtividadeReal
 * (data/categoria/horas) — então uma lista destas alimenta o motor direto —,
 * somando o id (para editar/apagar) e a proveniência da captura.
 */
export interface Atividade extends AtividadeReal {
  id: string
  projeto: string
  textoBruto: string | null
  atividadeMapeada: string | null
}

/** O que a captura envia para criar. O user_id vem do servidor, nunca daqui. */
export interface NovaAtividade {
  projeto: string
  data: string
  categoria: string
  horas: number
  textoBruto?: string
  atividadeMapeada?: string
}

/** Campos editáveis na confirmação. Nunca id, projeto ou dono. */
export type AtividadePatch = Partial<
  Pick<NovaAtividade, 'data' | 'categoria' | 'horas' | 'textoBruto' | 'atividadeMapeada'>
>
