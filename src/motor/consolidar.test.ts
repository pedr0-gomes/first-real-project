import { describe, expect, it } from 'vitest';
import type { ProjetoConfig } from '../config/types.js';
import { consolidar } from './consolidar.js';

// Config mínima e óbvia: a grade fixa (4h na segunda) já fecha a carga semanal
// (4h). Em toda semana cheia, sobra ΔH = 0 → o motor não deve gerar coringa.
const configCheiaPelaGrade: ProjetoConfig = {
  id: 'teste',
  nome: 'Teste',
  cargaSemanal: 4,
  vocabulario: { Reuniao: { descricaoOficial: 'Reunião' } },
  gradeSemanal: [{ dia: 'seg', categoria: 'Reuniao', horas: 4 }],
  defaultHorasPorCategoria: { Reuniao: 2 },
  atividadeCoringa: 'Coringa',
  semanaParcial: 'cheia',
  tetoHorasDiaCoringa: 4,
  aceitaFimDeSemana: false,
};

describe('consolidar — semana cheia só com grade fixa', () => {
  // Junho/2026 começa numa segunda; a II SEMANA (8–14/jun) é seg→dom inteira
  // no interior do mês — livre de semana parcial (slice 03).
  it('fecha a carga com a grade, sem gerar coringa', () => {
    const { semanas } = consolidar([], configCheiaPelaGrade, { ano: 2026, mes: 6 });

    const semanaII = semanas.find((s) => s.indice === 2);
    expect(semanaII).toBeDefined();
    expect(semanaII!.inicio).toBe('2026-06-08');
    expect(semanaII!.fim).toBe('2026-06-14');
    expect(semanaII!.totalHoras).toBe(4);
    expect(semanaII!.entradas).toEqual([
      { data: '2026-06-08', categoria: 'Reuniao', horas: 4, origem: 'grade' },
    ]);
    expect(semanaII!.entradas.some((e) => e.origem === 'coringa')).toBe(false);
  });
});

// Grade (4h na segunda) não fecha a carga (8h) → ΔH = 4h, que o motor preenche
// com o coringa nos dias úteis livres (ter–sex), sem tocar a segunda nem o
// fim de semana (aceitaFimDeSemana: false).
const configComDeltaH: ProjetoConfig = {
  ...configCheiaPelaGrade,
  cargaSemanal: 8,
};

// ΔH = 6 (carga 8 − grade 2h na seg) sobre 4 dias úteis livres (ter–sex):
// uniforme 1h cada, resto (2h) no último útil → sexta com 3h.
const configResto: ProjetoConfig = {
  ...configCheiaPelaGrade,
  cargaSemanal: 8,
  gradeSemanal: [{ dia: 'seg', categoria: 'Reuniao', horas: 2 }],
};

describe('consolidar — coringa fecha a carga', () => {
  it('preenche ΔH com coringa em dias úteis livres', () => {
    const { semanas } = consolidar([], configComDeltaH, { ano: 2026, mes: 6 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    const diasUteisLivres = ['2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12'];
    const coringa = semanaII.entradas.filter((e) => e.origem === 'coringa');

    expect(semanaII.totalHoras).toBe(8);
    expect(coringa.reduce((soma, e) => soma + e.horas, 0)).toBe(4);
    expect(coringa.every((e) => diasUteisLivres.includes(e.data))).toBe(true);
    expect(coringa.every((e) => e.categoria === 'Coringa')).toBe(true);
    // A segunda continua intacta: só a grade, sem coringa empilhado.
    expect(semanaII.entradas.filter((e) => e.data === '2026-06-08')).toEqual([
      { data: '2026-06-08', categoria: 'Reuniao', horas: 4, origem: 'grade' },
    ]);
  });

  it('atividade real reduz o ΔH e o coringa não cai no dia ocupado', () => {
    // grade 4h (seg) + real 2h (qua 10/jun) = 6h → ΔH = 2h de coringa.
    const realQuarta = [{ data: '2026-06-10', categoria: 'Reuniao', horas: 2 }];
    const { semanas } = consolidar(realQuarta, configComDeltaH, { ano: 2026, mes: 6 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    const coringa = semanaII.entradas.filter((e) => e.origem === 'coringa');

    expect(semanaII.totalHoras).toBe(8);
    expect(semanaII.entradas).toContainEqual({
      data: '2026-06-10',
      categoria: 'Reuniao',
      horas: 2,
      origem: 'real',
    });
    expect(coringa.reduce((soma, e) => soma + e.horas, 0)).toBe(2);
    // Coringa só nos úteis livres restantes: ter(09), qui(11), sex(12).
    const livres = ['2026-06-09', '2026-06-11', '2026-06-12'];
    expect(coringa.every((e) => livres.includes(e.data))).toBe(true);
  });

  it('distribui ΔH uniforme e joga o resto no último dia útil (sexta)', () => {
    const { semanas } = consolidar([], configResto, { ano: 2026, mes: 6 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    const coringa = semanaII.entradas
      .filter((e) => e.origem === 'coringa')
      .map((e) => ({ data: e.data, horas: e.horas }));

    expect(semanaII.totalHoras).toBe(8);
    expect(coringa).toEqual([
      { data: '2026-06-09', horas: 1 }, // ter
      { data: '2026-06-10', horas: 1 }, // qua
      { data: '2026-06-11', horas: 1 }, // qui
      { data: '2026-06-12', horas: 3 }, // sex ← resto (2h) somado
    ]);
  });

  it('respeita o teto soft: o resto recua em vez de furar o teto na sexta', () => {
    // ΔH = 6, mesmos 4 livres, mas teto 2 → sexta não pode levar 3.
    const configTeto: ProjetoConfig = { ...configResto, tetoHorasDiaCoringa: 2 };
    const { semanas } = consolidar([], configTeto, { ano: 2026, mes: 6 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    const coringa = semanaII.entradas
      .filter((e) => e.origem === 'coringa')
      .map((e) => ({ data: e.data, horas: e.horas }));

    expect(semanaII.totalHoras).toBe(8);
    expect(coringa).toEqual([
      { data: '2026-06-09', horas: 1 }, // ter
      { data: '2026-06-10', horas: 1 }, // qua
      { data: '2026-06-11', horas: 2 }, // qui ← recebeu parte do resto
      { data: '2026-06-12', horas: 2 }, // sex ← tampada no teto
    ]);
  });

  it('transborda pro sábado quando os úteis saturam e aceitaFimDeSemana', () => {
    // ΔH = 10, teto 2, 4 úteis livres → 8h cabem; 2h sobram pro sábado.
    const configFimDeSemana: ProjetoConfig = {
      ...configResto,
      cargaSemanal: 12,
      tetoHorasDiaCoringa: 2,
      aceitaFimDeSemana: true,
    };
    const { semanas } = consolidar([], configFimDeSemana, { ano: 2026, mes: 6 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    const coringa = semanaII.entradas
      .filter((e) => e.origem === 'coringa')
      .map((e) => ({ data: e.data, horas: e.horas }));

    expect(semanaII.totalHoras).toBe(12);
    expect(coringa).toEqual([
      { data: '2026-06-09', horas: 2 }, // ter
      { data: '2026-06-10', horas: 2 }, // qua
      { data: '2026-06-11', horas: 2 }, // qui
      { data: '2026-06-12', horas: 2 }, // sex
      { data: '2026-06-13', horas: 2 }, // sáb ← transbordo permitido
    ]);
  });

  it('o teto soft nunca corta atividade real (só guia o coringa)', () => {
    // Real de 6h na terça com teto 2: a real entra intacta; o teto só limitaria
    // coringa. grade 2h + real 6h = 8h = carga → ΔH 0, sem coringa.
    const configTeto2: ProjetoConfig = { ...configResto, tetoHorasDiaCoringa: 2 };
    const realPesada = [{ data: '2026-06-09', categoria: 'Reuniao', horas: 6 }];
    const { semanas } = consolidar(realPesada, configTeto2, { ano: 2026, mes: 6 });

    const semanaII = semanas.find((s) => s.indice === 2)!;
    expect(semanaII.totalHoras).toBe(8);
    expect(semanaII.entradas).toContainEqual({
      data: '2026-06-09',
      categoria: 'Reuniao',
      horas: 6, // intacta, acima do teto 2
      origem: 'real',
    });
    expect(semanaII.entradas.some((e) => e.origem === 'coringa')).toBe(false);
  });
});
