# 05 — Mapeador semântico (LLM mockado)

> Tipo: AFK · TDD com LLM mockado · Fonte: PRD §"Módulo: Mapeador semântico"

> ⚠️ **Resolver antes de implementar o call real:** provider de LLM
> (Claude `claude-haiku` vs OpenAI `gpt-4o-mini`) + SDK (direta vs Vercel AI SDK).
> Decisão HITL deixada pelo PRD; o mapeador é onde o LLM mora, então ela pertence
> aqui. Critério de escolha: modelo pequeno por custo (chamada só na captura, o
> resultado é salvo → custo zero nas telas seguintes). Os testes deste slice usam
> mock e **não** dependem dessa decisão; só a chamada real depende.

## What to build

O wrapper que recebe texto livre + config (vocabulário) e devolve atividades
estruturadas (categoria do vocabulário oficial + horas sugeridas). É o **único**
ponto de LLM do produto, e fechado: NL→structured e nada mais — nunca soma, nunca
vê a carga, nunca fecha carga, nunca inventa atividade.

Comportamento da *nossa* lógica em volta do LLM (o que se testa):

- Parsing do retorno do LLM em atividades estruturadas.
- Extrair várias atividades de uma frase só (ex: "fiz 2 listas e atendi alunos").
- Horas: usar o que o texto informa; quando não informa, cair no
  `defaultHorasPorCategoria` da config.
- **Descarte de categoria excluída:** Instagram (LoOBI) é reconhecida e
  **descartada** — some do resultado, não vira "Outros" — e sinalizada como
  descartada (pra UI avisar na confirmação).
- Prompt enxuto: só o vocabulário do projeto + o texto.

## Acceptance criteria

- [ ] Testes escritos antes, com LLM mockado (não se testa o LLM em si)
- [ ] Retorno do mock parseado corretamente em atividades estruturadas
- [ ] Múltiplas atividades extraídas de uma frase única
- [ ] Sem horas no texto → fallback `defaultHorasPorCategoria`
- [ ] Categoria excluída (Instagram) sai do resultado e vem marcada como descarte
- [ ] Categoria fora do vocabulário não inventa entrada nova indevida
- [ ] Interface do wrapper é mockável (a chamada real é injetável/substituível)

## Blocked by

- 01 — Config dos projetos
