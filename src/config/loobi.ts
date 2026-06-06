import type { ProjetoConfig } from './types';

// Fonte canônica: docs/template/extensão.md (SIGAA/UFCA).
// Carga 8h/sem · semana parcial fecha cheia · Instagram descartado.
export const loobi: ProjetoConfig = {
  id: 'loobi',
  nome: 'LoOBI',
  cargaSemanal: 8,

  vocabulario: {
    Blog: {
      descricaoOficial: 'Produção de conteúdo para o blog',
    },
    Podcast: {
      descricaoOficial: 'Produção de episódio do podcast',
    },
    Reunião: {
      descricaoOficial: 'Reunião do grupo de extensão',
    },
    Pesquisa: {
      descricaoOficial: 'Levantamento de referências para as atividades',
    },
    Outros: {
      descricaoOficial: 'Atividade de apoio às ações do projeto',
    },
    // Reconhecida na captura para não virar "Outros", mas nunca vai ao relatório:
    // o motor compensa as horas com o coringa.
    Instagram: { descartada: true },
  },

  // Itens fixos recorrentes (do Calendar, confirmados pelo Pedro 2026-06-05).
  // Blog/Podcast/Pesquisa são esporádicos → entram por texto livre, não aqui.
  gradeSemanal: [
    { dia: 'qua', categoria: 'Reunião', horas: 1.5 }, // Reunião LACCA/LoOBI (maratona)
    { dia: 'qui', categoria: 'Reunião', horas: 2 }, //   Reunião Geral LoOBI (conselho)
  ],

  // Durações padrão por categoria (docs/template/extensão.md, Passo 3).
  defaultHorasPorCategoria: {
    Reunião: 1,
    Blog: 2,
    Podcast: 2,
    Pesquisa: 2,
    Outros: 1,
  },

  atividadeCoringa: 'Estudo e planejamento de atividades',
  semanaParcial: 'cheia',
  tetoHorasDiaCoringa: 4, // valor de bom senso — a confirmar com Pedro
  aceitaFimDeSemana: false,
};
