import type { ProjetoConfig } from '../config/types.js';
import type { Consolidacao, EntradaSemana, SemanaConsolidada } from '../motor/types.js';

// Formatador de relatório (slice 04): Consolidacao → string no template exato da
// instituição, pronta pra copiar. Função pura, sem aritmética — o motor já fechou
// tudo. Aqui só renderiza: ordena por data, resolve a descrição oficial pela
// origem, formata datas/horas e numera as semanas. As flags ficam fora da string
// (vivem na Consolidacao para a UI mostrar na revisão).

const MESES_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/**
 * Renderiza o relatório mensal de `consolidacao` no template de `config`.
 * Pré-condição: a Consolidacao foi produzida a partir desta mesma config.
 */
export function formatar(consolidacao: Consolidacao, config: ProjetoConfig): string {
  const { mes, semanas } = consolidacao;
  const cabecalho = `Relatório de Frequência — ${config.nome} — ${MESES_PT[mes.mes - 1]}/${mes.ano}`;
  const linhas = semanas.map((s) => formatarSemana(s, config));
  return `${cabecalho}\n\n${linhas.join('\n')}`;
}

/** Uma linha: `I SEMANA: DD/MM - descrição - Xh; ...`, terminada em `.`. */
function formatarSemana(semana: SemanaConsolidada, config: ProjetoConfig): string {
  const ordenadas = [...semana.entradas].sort((a, b) => a.data.localeCompare(b.data));
  const corpo = ordenadas
    .map((e) => `${formatarData(e.data)} - ${descricao(e, config)} - ${formatarHoras(e.horas)}h`)
    .join('; ');
  return `${ROMANOS[semana.indice - 1]} SEMANA: ${corpo}.`;
}

/** Descrição oficial a partir da origem: coringa vem da config; o resto, do vocabulário. */
function descricao(entrada: EntradaSemana, config: ProjetoConfig): string {
  if (entrada.origem === 'coringa') return config.atividadeCoringa;
  const categoria = config.vocabulario[entrada.categoria];
  if (categoria && !categoria.descartada) return categoria.descricaoOficial;
  return entrada.categoria; // fallback: o motor nunca emite categoria descartada/ausente.
}

/** 'YYYY-MM-DD' → 'DD/MM'. */
function formatarData(data: string): string {
  return `${data.slice(8, 10)}/${data.slice(5, 7)}`;
}

/** Inteiro → '2'; fracionado → '1,5' (vírgula pt-BR). */
function formatarHoras(horas: number): string {
  return Number.isInteger(horas) ? String(horas) : String(horas).replace('.', ',');
}
