import type { DiaDaSemana, ProjetoConfig } from '../config/types.js';
import type {
  AtividadeReal,
  Consolidacao,
  EntradaSemana,
  SemanaConsolidada,
} from './types.js';

const UM_DIA = 86_400_000;

/** Offset em dias a partir da segunda-feira (início da semana do relatório). */
const OFFSET_DESDE_SEGUNDA: Record<DiaDaSemana, number> = {
  seg: 0,
  ter: 1,
  qua: 2,
  qui: 3,
  sex: 4,
  sab: 5,
  dom: 6,
};

/** ms UTC → 'YYYY-MM-DD'. */
function iso(ms: number): string {
  const d = new Date(ms);
  const ano = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(d.getUTCDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** 'YYYY-MM-DD' → ms UTC. */
function parseIso(s: string): number {
  const [ano, mes, dia] = s.split('-');
  return Date.UTC(Number(ano), Number(mes) - 1, Number(dia));
}

/**
 * Motor de consolidação (núcleo, slice 02): atividades reais + config + mês →
 * estrutura semanal com a carga fechada pelo coringa. Função pura, sem I/O.
 */
export function consolidar(
  atividades: AtividadeReal[],
  config: ProjetoConfig,
  mes: { ano: number; mes: number },
): Consolidacao {
  const primeiroDoMes = Date.UTC(mes.ano, mes.mes - 1, 1);
  const ultimoDoMes = Date.UTC(mes.ano, mes.mes, 0);

  // Segunda-feira na ou antes do dia 1 (início da I SEMANA).
  const diaSemana = new Date(primeiroDoMes).getUTCDay(); // 0=dom..6=sáb
  const recuoAteSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
  const primeiraSegunda = primeiroDoMes - recuoAteSegunda * UM_DIA;

  const semanas: SemanaConsolidada[] = [];
  for (
    let inicio = primeiraSegunda, indice = 1;
    inicio <= ultimoDoMes;
    inicio += 7 * UM_DIA, indice++
  ) {
    const fim = inicio + 6 * UM_DIA;

    // Horas reais da semana: grade fixa expandida + atividades capturadas.
    const entradas: EntradaSemana[] = config.gradeSemanal.map((item) => ({
      data: iso(inicio + OFFSET_DESDE_SEGUNDA[item.dia] * UM_DIA),
      categoria: item.categoria,
      horas: item.horas,
      origem: 'grade',
    }));
    for (const a of atividades) {
      const ms = parseIso(a.data);
      if (ms >= inicio && ms <= fim) {
        entradas.push({ ...a, origem: 'real' });
      }
    }

    const reais = entradas.reduce((soma, e) => soma + e.horas, 0);
    const deltaH = config.cargaSemanal - reais;
    if (deltaH > 0) {
      preencherCoringa(entradas, inicio, deltaH, config);
    }

    semanas.push({
      indice,
      inicio: iso(inicio),
      fim: iso(fim),
      entradas,
      totalHoras: entradas.reduce((soma, e) => soma + e.horas, 0),
    });
  }

  return { projeto: config.id, mes, semanas };
}

/**
 * Distribui ΔH com a atividade-coringa: primeiro nos dias úteis livres (seg–sex
 * sem atividade real/grade), uniforme com o resto derramado da sexta recuando e
 * tampado pelo teto soft; o que ainda sobrar transborda pro fim de semana se
 * `aceitaFimDeSemana`. Muta `entradas`.
 */
function preencherCoringa(
  entradas: EntradaSemana[],
  inicioSemana: number,
  deltaH: number,
  config: ProjetoConfig,
): void {
  const ocupados = new Set(entradas.map((e) => e.data));
  const teto = config.tetoHorasDiaCoringa;
  const distribuido: { ms: number; horas: number }[] = [];

  // Fase 1 — dias úteis livres (seg–sex): base uniforme + resto derramado da
  // sexta recuando, cada dia tampado pelo teto soft.
  const uteis: number[] = [];
  for (let i = 0; i < 5; i++) {
    const ms = inicioSemana + i * UM_DIA;
    if (!ocupados.has(iso(ms))) uteis.push(ms);
  }

  let resto = deltaH;
  if (uteis.length > 0) {
    const base = Math.floor(deltaH / uteis.length);
    const horas = uteis.map(() => base);
    resto = deltaH - base * uteis.length;
    for (let i = horas.length - 1; i >= 0 && resto > 0; i--) {
      const add = Math.min(teto - horas[i]!, resto);
      if (add > 0) {
        horas[i]! += add;
        resto -= add;
      }
    }
    uteis.forEach((ms, i) => distribuido.push({ ms, horas: horas[i]! }));
  }

  // Fase 2 — transbordo pro fim de semana (sáb→dom), só se sobrou e a config
  // permite. Atividade real nunca chega aqui; é só o coringa que extravasa.
  if (resto > 0 && config.aceitaFimDeSemana) {
    for (let i = 5; i < 7 && resto > 0; i++) {
      const ms = inicioSemana + i * UM_DIA;
      if (ocupados.has(iso(ms))) continue;
      const add = Math.min(teto, resto);
      distribuido.push({ ms, horas: add });
      resto -= add;
    }
  }

  for (const { ms, horas } of distribuido) {
    if (horas > 0) {
      entradas.push({
        data: iso(ms),
        categoria: config.atividadeCoringa,
        horas,
        origem: 'coringa',
      });
    }
  }
}
