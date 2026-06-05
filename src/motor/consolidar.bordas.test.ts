import { describe, expect, it } from 'vitest';
import type { ProjetoConfig } from '../config/types.js';
import { consolidar } from './consolidar.js';

// Config de borda, grade vazia para isolar o coringa e as regras de ponta.
// Proporcional (como a monitoria); teto alto para não interferir nos cálculos.
const base: ProjetoConfig = {
  id: 'borda',
  nome: 'Borda',
  cargaSemanal: 12,
  vocabulario: { Plantao: { descricaoOficial: 'Plantão' } },
  gradeSemanal: [],
  defaultHorasPorCategoria: { Plantao: 2 },
  atividadeCoringa: 'Coringa',
  semanaParcial: 'proporcional',
  tetoHorasDiaCoringa: 8,
  aceitaFimDeSemana: false,
};

describe('consolidar — semana parcial proporcional (alvo)', () => {
  // Julho/2026 começa numa quarta → I SEMANA = seg 29/jun → dom 05/jul, com
  // só 3 dias úteis DENTRO de julho (qua 01, qui 02, sex 03).
  // alvo = round(12 × 3/5) = round(7.2) = 7.
  it('reduz o alvo à proporção dos dias úteis no mês', () => {
    const { semanas } = consolidar([], base, { ano: 2026, mes: 7 });

    const semanaI = semanas.find((s) => s.indice === 1)!;
    expect(semanaI.inicio).toBe('2026-06-29');
    expect(semanaI.alvoHoras).toBe(7);
    expect(semanaI.totalHoras).toBe(7);
  });

  it('não joga coringa nos dias da semana que caem no mês vizinho', () => {
    const { semanas } = consolidar([], base, { ano: 2026, mes: 7 });

    const semanaI = semanas.find((s) => s.indice === 1)!;
    // 29 e 30/jun pertencem ao relatório de junho — nada de julho cai lá.
    expect(semanaI.entradas.every((e) => e.data.startsWith('2026-07'))).toBe(true);
  });
});

describe('consolidar — flag parcial-proporcional', () => {
  it('sinaliza a semana parcial proporcional para revisão', () => {
    const { semanas } = consolidar([], base, { ano: 2026, mes: 7 });

    const semanaI = semanas.find((s) => s.indice === 1)!;
    expect(semanaI.flags).toContainEqual({ tipo: 'parcial-proporcional' });
  });

  it('não sinaliza semana interior cheia de dias úteis no mês', () => {
    // II SEMANA de julho = seg 06 → dom 12, 5 dias úteis no mês → alvo cheio.
    const { semanas } = consolidar([], base, { ano: 2026, mes: 7 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    expect(semanaII.alvoHoras).toBe(12);
    expect(semanaII.flags.some((f) => f.tipo === 'parcial-proporcional')).toBe(false);
  });
});

describe('consolidar — flag sem-atividade-real', () => {
  it('sinaliza semana com zero atividade real', () => {
    // II SEMANA de julho, sem nenhuma atividade real capturada.
    const { semanas } = consolidar([], base, { ano: 2026, mes: 7 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    expect(semanaII.flags).toContainEqual({ tipo: 'sem-atividade-real' });
  });

  it('não sinaliza quando há atividade real na semana', () => {
    const realQuarta = [{ data: '2026-07-08', categoria: 'Plantao', horas: 2 }];
    const { semanas } = consolidar(realQuarta, base, { ano: 2026, mes: 7 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    expect(semanaII.flags.some((f) => f.tipo === 'sem-atividade-real')).toBe(false);
  });
});

describe('consolidar — flag acima-do-alvo', () => {
  it('alerta sem cortar a atividade real acima do alvo', () => {
    // Config cheia, carga 8; real de 10h numa semana interior → 10 > 8.
    const cheia: ProjetoConfig = { ...base, semanaParcial: 'cheia', cargaSemanal: 8 };
    const realPesada = [{ data: '2026-07-08', categoria: 'Plantao', horas: 10 }];
    const { semanas } = consolidar(realPesada, cheia, { ano: 2026, mes: 7 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    expect(semanaII.totalHoras).toBe(10); // real intacta, sem corte
    expect(semanaII.entradas.some((e) => e.origem === 'coringa')).toBe(false);
    expect(semanaII.flags).toContainEqual({ tipo: 'acima-do-alvo', alvo: 8, real: 10 });
  });
});

describe('consolidar — flag carga-incompleta', () => {
  it('sinaliza quando o coringa satura e não fecha o alvo', () => {
    // Carga 12, teto 2, fim de semana off, 5 dias úteis livres: a base uniforme
    // já bate no teto (floor(12/5)=2) → 10h alocadas, 2h sem onde cair. O teto é
    // soft (não corta a base), mas o resto que não desce vira flag em vez de
    // sumir em silêncio (o buraco que o slice 02 deixou).
    const apertada: ProjetoConfig = {
      ...base,
      semanaParcial: 'cheia',
      cargaSemanal: 12,
      tetoHorasDiaCoringa: 2,
      aceitaFimDeSemana: false,
    };
    const { semanas } = consolidar([], apertada, { ano: 2026, mes: 7 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    expect(semanaII.alvoHoras).toBe(12);
    expect(semanaII.totalHoras).toBe(10);
    expect(semanaII.flags).toContainEqual({ tipo: 'carga-incompleta', faltam: 2 });
  });
});
