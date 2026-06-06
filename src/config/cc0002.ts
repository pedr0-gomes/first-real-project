import type { ProjetoConfig } from './types';

// Fonte canônica: docs/template/monitoria.md (edital de Monitoria/UFCA).
// Carga 12h/sem · semana parcial proporcional · sem categoria descartada.
export const cc0002: ProjetoConfig = {
  id: 'cc0002',
  nome: 'Monitoria CC0002',
  cargaSemanal: 12,

  vocabulario: {
    Plantão: {
      descricaoOficial: 'Atendimento individualizado ou em pequenos grupos',
    },
    Reunião: {
      descricaoOficial: 'Reunião com o orientador',
    },
    'Material de Apoio': {
      descricaoOficial:
        'Estudo e aplicação de método e técnicas de ensino/aprendizagem',
    },
    'Lista Comentada': {
      descricaoOficial: 'Lista comentada de exercícios para os alunos',
    },
    Videoaula: {
      descricaoOficial: 'Material audiovisual de apoio às aulas',
    },
    Classroom: {
      descricaoOficial: 'Organização de materiais no ambiente virtual da disciplina',
    },
    Outros: {
      descricaoOficial: 'Atividade de apoio à disciplina',
    },
  },

  // Plantões fixos — 6h de atendimento exigidas (do Calendar, confirmados pelo
  // Pedro 2026-06-05). As outras 6h da carga vêm de atividades soltas + coringa.
  gradeSemanal: [
    { dia: 'qua', categoria: 'Plantão', horas: 2 },
    { dia: 'qui', categoria: 'Plantão', horas: 1 },
    { dia: 'sex', categoria: 'Plantão', horas: 3 },
  ],

  // Durações padrão por categoria (docs/template/monitoria.md, Passo 3).
  defaultHorasPorCategoria: {
    Plantão: 2,
    Reunião: 1,
    'Material de Apoio': 2,
    'Lista Comentada': 2,
    Videoaula: 2,
    Classroom: 2,
    Outros: 1,
  },

  // Coincide textualmente com a categoria "Material de Apoio" — é fiel à fonte.
  atividadeCoringa: 'Estudo e aplicação de método e técnicas de ensino/aprendizagem',
  semanaParcial: 'proporcional',
  tetoHorasDiaCoringa: 4, // valor de bom senso — a confirmar com Pedro
  aceitaFimDeSemana: false,
};
