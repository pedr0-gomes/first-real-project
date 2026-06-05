import { describe, expect, it } from 'vitest';
import { loobi } from '../config/loobi.js';
import { cc0002 } from '../config/cc0002.js';
import type { ClienteLLM } from './types.js';
import { mapear } from './mapear.js';

/** Cliente mockado: ignora o prompt e devolve o JSON canned. */
function clienteFixo(json: string): ClienteLLM {
  return async () => json;
}

describe('mapear', () => {
  // Várias atividades numa frase só, ambas com horas no texto → fonte 'texto'.
  it('extrai múltiplas atividades de uma frase e respeita as horas do texto', async () => {
    const cliente = clienteFixo(
      '[{"categoria":"Lista Comentada","horas":3},{"categoria":"Plantão","horas":2}]',
    );

    const r = await mapear('fiz uma lista comentada e dei plantão', cc0002, cliente);

    expect(r.atividades).toEqual([
      { categoria: 'Lista Comentada', horas: 3, fonteHoras: 'texto' },
      { categoria: 'Plantão', horas: 2, fonteHoras: 'texto' },
    ]);
    expect(r.descartes).toEqual([]);
  });

  // Sem horas no texto (null) → fallback em defaultHorasPorCategoria, fonte 'default'.
  it('cai no default da config quando o texto não informa horas', async () => {
    const cliente = clienteFixo('[{"categoria":"Podcast","horas":null}]');

    const r = await mapear('gravei um podcast', loobi, cliente);

    expect(r.atividades).toEqual([{ categoria: 'Podcast', horas: 2, fonteHoras: 'default' }]);
  });

  // Instagram (LoOBI) é reconhecida e descartada: sai das atividades, vai pros
  // descartes — nunca vira "Outros".
  it('descarta categoria excluída (Instagram) e a sinaliza', async () => {
    const cliente = clienteFixo(
      '[{"categoria":"Instagram","horas":2},{"categoria":"Blog","horas":1}]',
    );

    const r = await mapear('postei no instagram e escrevi no blog', loobi, cliente);

    expect(r.atividades).toEqual([{ categoria: 'Blog', horas: 1, fonteHoras: 'texto' }]);
    expect(r.descartes).toEqual([{ categoria: 'Instagram' }]);
  });

  // Categoria fora do vocabulário não vira entrada nova: é ignorada (não inventa).
  it('ignora categoria fora do vocabulário', async () => {
    const cliente = clienteFixo(
      '[{"categoria":"Futebol","horas":5},{"categoria":"Blog","horas":2}]',
    );

    const r = await mapear('joguei bola e escrevi no blog', loobi, cliente);

    expect(r.atividades).toEqual([{ categoria: 'Blog', horas: 2, fonteHoras: 'texto' }]);
    expect(r.descartes).toEqual([]);
  });

  // Prompt enxuto: leva o vocabulário (inclusive o descartado, pra o LLM
  // reconhecer em vez de mapear errado) e o texto do Pedro.
  it('monta o prompt com o vocabulário e o texto', async () => {
    let promptRecebido = '';
    const cliente: ClienteLLM = async (p) => {
      promptRecebido = p;
      return '[]';
    };

    await mapear('gravei um podcast', loobi, cliente);

    expect(promptRecebido).toContain('Podcast');
    expect(promptRecebido).toContain('Instagram');
    expect(promptRecebido).toContain('gravei um podcast');
  });
});
