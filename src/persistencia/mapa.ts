import type { Atividade, LinhaAtividade } from './types'

/** Linha do Postgres → domínio. Pura: isola o snake_case da borda do miolo. */
export function linhaParaAtividade(linha: LinhaAtividade): Atividade {
  return {
    id: linha.id,
    projeto: linha.project_id,
    data: linha.date,
    categoria: linha.category,
    horas: linha.hours,
    textoBruto: linha.raw_text,
    atividadeMapeada: linha.mapped_activity,
  }
}
