// Ponto de entrada das configs. Consumidores (motor, formatador, mapeador)
// importam daqui — `projetos[id]` resolve a config pela chave de persistência.
import type { ProjetoConfig } from './types';
import { loobi } from './loobi';
import { cc0002 } from './cc0002';

export type { ProjetoConfig } from './types';
export type {
  DiaDaSemana,
  EstrategiaSemanaParcial,
  CategoriaVocabulario,
  ItemGrade,
} from './types';

export const projetos = {
  [loobi.id]: loobi,
  [cc0002.id]: cc0002,
} satisfies Record<string, ProjetoConfig>;

export type ProjetoId = keyof typeof projetos;
