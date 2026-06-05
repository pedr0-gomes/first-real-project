# 08 — UI de captura semanal + confirmação

> Tipo: AFK · Verificação manual · Fonte: PRD §"Fluxo de captura" + §"Auth + rotas/UI"

## What to build

A superfície de captura, cadência semanal. A semana abre **pré-preenchida com a
grade fixa** da config. Pedro então:

1. **Edita ou cancela** itens fixos manualmente (ex: feriado caiu na terça) — isto
   é edição manual, **não** NL→diff. O texto livre nunca cancela/altera a grade.
2. **Descreve atividades novas em texto livre** → mapeador (slice 05) estrutura →
   **tela de confirmação**: revisar atividades extraídas, editar horas de
   qualquer uma, ver o que foi **descartado** por categoria excluída (Instagram) →
   salvar **só as atividades reais** (slice 06).

O motor e o coringa **não** entram aqui — só na geração (slice 09).

> ⚠️ Depende da decisão de provider LLM + SDK registrada no slice 05.

## Acceptance criteria

- [ ] Semana abre com a grade fixa da config pré-preenchida
- [ ] Editar/cancelar item fixo manualmente reflete na semana
- [ ] Texto livre é **aditivo** — nunca altera/cancela a grade
- [ ] Texto livre → mapeador → tela de confirmação com atividades e horas editáveis
- [ ] Confirmação avisa o que foi descartado por categoria excluída
- [ ] Salvar persiste **só atividades reais** (grade e coringa não viram linha)
- [ ] Todas as Server Actions validam identidade com `supabase.auth.getUser()`

## Blocked by

- 05 — Mapeador semântico
- 06 — Persistência (Supabase)
- 07 — Auth usuário único
