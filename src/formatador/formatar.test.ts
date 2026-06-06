import { describe, expect, it } from 'vitest';
import { loobi } from '../config/loobi.js';
import { cc0002 } from '../config/cc0002.js';
import type { Consolidacao } from '../motor/types.js';
import { formatar } from './formatar.js';

describe('formatar', () => {
  // Golden LoOBI: a linha documentada em docs/template/extensão.md (Passo 5).
  // Entradas embaralhadas de propósito (o motor empurra grade→real→coringa, sem
  // ordenar) para provar que o formatador ordena por data.
  it('renderiza a semana da LoOBI no template exato', () => {
    const consolidacao: Consolidacao = {
      projeto: 'loobi',
      mes: { ano: 2026, mes: 5 },
      semanas: [
        {
          indice: 1,
          inicio: '2026-04-27',
          fim: '2026-05-03',
          entradas: [
            { data: '2026-05-06', categoria: loobi.atividadeCoringa, horas: 3, origem: 'coringa' },
            { data: '2026-05-04', categoria: 'Reunião', horas: 1, origem: 'real' },
            { data: '2026-05-07', categoria: loobi.atividadeCoringa, horas: 2, origem: 'coringa' },
            { data: '2026-05-05', categoria: 'Blog', horas: 2, origem: 'real' },
          ],
          alvoHoras: 8,
          totalHoras: 8,
          flags: [],
        },
      ],
    };

    const esperado =
      'Relatório de Frequência — LoOBI — maio/2026\n\n' +
      'I SEMANA: 04/05 - Reunião do grupo de extensão - 1h; ' +
      '05/05 - Produção de conteúdo para o blog - 2h; ' +
      '06/05 - Estudo e planejamento de atividades - 3h; ' +
      '07/05 - Estudo e planejamento de atividades - 2h.';

    expect(formatar(consolidacao, loobi)).toBe(esperado);
  });

  // Golden Monitoria: a linha documentada em docs/template/monitoria.md (Passo 5).
  // A flag parcial-proporcional está presente para provar que NÃO vai à string.
  it('renderiza a semana da Monitoria e ignora as flags', () => {
    const consolidacao: Consolidacao = {
      projeto: 'cc0002',
      mes: { ano: 2026, mes: 5 },
      semanas: [
        {
          indice: 1,
          inicio: '2026-04-27',
          fim: '2026-05-03',
          entradas: [
            { data: '2026-05-05', categoria: 'Plantão', horas: 2, origem: 'real' },
            { data: '2026-05-06', categoria: cc0002.atividadeCoringa, horas: 4, origem: 'coringa' },
            { data: '2026-05-07', categoria: 'Plantão', horas: 2, origem: 'real' },
            { data: '2026-05-08', categoria: cc0002.atividadeCoringa, horas: 4, origem: 'coringa' },
          ],
          alvoHoras: 12,
          totalHoras: 12,
          flags: [{ tipo: 'parcial-proporcional' }],
        },
      ],
    };

    const esperado =
      'Relatório de Frequência — Monitoria CC0002 — maio/2026\n\n' +
      'I SEMANA: 05/05 - Atendimento individualizado ou em pequenos grupos na sala de monitoria - 2h; ' +
      '06/05 - Estudo e aplicação de método e técnicas de ensino/aprendizagem - 4h; ' +
      '07/05 - Atendimento individualizado ou em pequenos grupos na sala de monitoria - 2h; ' +
      '08/05 - Estudo e aplicação de método e técnicas de ensino/aprendizagem - 4h.';

    expect(formatar(consolidacao, cc0002)).toBe(esperado);
  });

  // Múltiplas semanas: numeração romana avança e horas fracionadas viram vírgula.
  it('numera semanas em romano e renderiza horas fracionadas com vírgula', () => {
    const consolidacao: Consolidacao = {
      projeto: 'loobi',
      mes: { ano: 2026, mes: 5 },
      semanas: [
        {
          indice: 1,
          inicio: '2026-04-27',
          fim: '2026-05-03',
          entradas: [{ data: '2026-05-04', categoria: 'Reunião', horas: 1.5, origem: 'grade' }],
          alvoHoras: 8,
          totalHoras: 1.5,
          flags: [],
        },
        {
          indice: 2,
          inicio: '2026-05-04',
          fim: '2026-05-10',
          entradas: [{ data: '2026-05-11', categoria: 'Blog', horas: 2, origem: 'real' }],
          alvoHoras: 8,
          totalHoras: 2,
          flags: [],
        },
      ],
    };

    const esperado =
      'Relatório de Frequência — LoOBI — maio/2026\n\n' +
      'I SEMANA: 04/05 - Reunião do grupo de extensão - 1,5h.\n' +
      'II SEMANA: 11/05 - Produção de conteúdo para o blog - 2h.';

    expect(formatar(consolidacao, loobi)).toBe(esperado);
  });

  // Pura: mesma entrada → mesma saída.
  it('é pura', () => {
    const consolidacao: Consolidacao = {
      projeto: 'loobi',
      mes: { ano: 2026, mes: 5 },
      semanas: [
        {
          indice: 1,
          inicio: '2026-04-27',
          fim: '2026-05-03',
          entradas: [{ data: '2026-05-04', categoria: 'Reunião', horas: 1, origem: 'real' }],
          alvoHoras: 8,
          totalHoras: 1,
          flags: [],
        },
      ],
    };

    expect(formatar(consolidacao, loobi)).toBe(formatar(consolidacao, loobi));
  });
});
