# 09 — UI de geração do relatório

> Tipo: AFK · Verificação manual · Fonte: PRD §"Auth + rotas/UI" + User Stories 20–22

## What to build

A tela que fecha o ciclo: Pedro escolhe **mês de referência** e **projeto**
(monitoria ou LoOBI), o sistema carrega as atividades reais salvas (slice 06),
roda o **motor** (slices 02+03) pra fechar a carga com o coringa e levantar flags,
passa pelo **formatador** (slice 04) e exibe o relatório num bloco de código
pronto pra copiar e colar no destino oficial. Flags de inconsistência aparecem
pra revisão antes do envio.

## Acceptance criteria

- [ ] Seletor de mês de referência e de projeto (alterna monitoria ↔ LoOBI)
- [ ] Carrega só as atividades reais do mês/projeto do usuário logado
- [ ] Roda motor + formatador e exibe a string no template exato, em bloco copiável
- [ ] Flags do motor (zero atividade, parcial proporcional, acima do alvo) visíveis
- [ ] Todas as Server Actions / Route Handlers validam com `supabase.auth.getUser()`
- [ ] Verificado manualmente: relatório de um mês real bate com o esperado

## Blocked by

- 03 — Motor de consolidação: bordas
- 04 — Formatador de relatório
- 06 — Persistência (Supabase)
- 07 — Auth usuário único
