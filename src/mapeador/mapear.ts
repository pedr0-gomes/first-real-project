import type { ProjetoConfig } from '../config/types.js';
import type {
  AtividadeExtraida,
  CategoriaDescartada,
  ClienteLLM,
  ResultadoMapeamento,
} from './types.js';

// Mapeador semântico (slice 05): texto livre + config → atividades estruturadas.
// Único ponto de LLM do produto, e fechado — NL→structured e nada mais. O LLM
// nunca soma, nunca vê a carga, nunca inventa. Toda a regra abaixo é nossa.

/** O que esperamos do LLM por item: a categoria e as horas (null se não disser). */
interface ItemLLM {
  categoria: string;
  horas: number | null;
}

export async function mapear(
  texto: string,
  config: ProjetoConfig,
  cliente: ClienteLLM,
): Promise<ResultadoMapeamento> {
  const bruto = await cliente(montarPrompt(texto, config));
  const itens = JSON.parse(bruto) as ItemLLM[];

  const atividades: AtividadeExtraida[] = [];
  const descartes: CategoriaDescartada[] = [];

  for (const item of itens) {
    const categoria = config.vocabulario[item.categoria];
    if (!categoria) continue; // fora do vocabulário → não inventa entrada.
    if (categoria.descartada) {
      descartes.push({ categoria: item.categoria });
      continue;
    }
    if (item.horas != null) {
      atividades.push({ categoria: item.categoria, horas: item.horas, fonteHoras: 'texto' });
      continue;
    }
    const padrao = config.defaultHorasPorCategoria[item.categoria];
    if (padrao == null) continue; // sem horas e sem default → não inventa horas.
    atividades.push({ categoria: item.categoria, horas: padrao, fonteHoras: 'default' });
  }

  return { atividades, descartes };
}

/** Prompt enxuto: o vocabulário oficial (inclusive o descartado, pra reconhecer) + o texto. */
function montarPrompt(texto: string, config: ProjetoConfig): string {
  const categorias = Object.keys(config.vocabulario).join(', ');
  return [
    `Vocabulário oficial: ${categorias}.`,
    'Extraia as atividades do texto abaixo como JSON: lista de {"categoria","horas"}.',
    'Use só categorias do vocabulário; "horas" é null quando o texto não informar.',
    '',
    texto,
  ].join('\n');
}
