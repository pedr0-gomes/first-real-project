# 01 — Config dos projetos

> Tipo: AFK · Fonte: PRD §"Módulo: Config dos projetos"

## What to build

O tipo TypeScript estático que descreve um projeto (vínculo) e as duas configs
concretas — LoOBI e monitoria CC0002 — preenchidas a partir das fontes canônicas
em `docs/template/`. Esta é a fundação: motor, formatador e mapeador todos
consomem esse shape. Projeto novo no futuro = escrever mais uma config, não tocar
no motor.

Shape fechado no grill-me:

- `cargaSemanal: number`
- `vocabulario` — categorias com descrição oficial e flag de descarte
  (ex: Instagram na LoOBI: reconhecida, mas descartada — não vira "Outros")
- `gradeSemanal` — itens fixos (diaDaSemana → categoria → horas)
- `defaultHorasPorCategoria` — fallback quando o texto não informa horas
- `atividadeCoringa` — descrição oficial do preenchimento
- `semanaParcial: 'cheia' | 'proporcional'`
- `tetoHorasDiaCoringa: number`
- `aceitaFimDeSemana: boolean`

Valores por projeto: LoOBI 8h/sem, parcial `'cheia'`, coringa "Estudo e
planejamento de atividades do projeto LoOBI", Instagram descartado. Monitoria
CC0002 12h/sem, parcial `'proporcional'`, coringa "Estudo e aplicação de método e
técnicas de ensino/aprendizagem".

## Acceptance criteria

- [ ] Tipo da config definido, sem `any`, com a flag de descarte no vocabulário
- [ ] Config LoOBI completa e fiel a `docs/template/extensão.md`
- [ ] Config CC0002 completa e fiel a `docs/template/monitoria.md`
- [ ] Type-checks sem erro; as duas configs satisfazem o tipo
- [ ] Substitui o `diretrizesEspeciais` do dump da pesquisa (não reintroduzir)

## Blocked by

None - can start immediately.
