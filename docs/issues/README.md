# Issues — vertical slices do PRD

Fatiamento do `docs/PRD.md` em slices independentemente pegáveis (via `/to-issues`,
2026-06-05). Sem tracker externo (decisão do CONTEXT): cada slice é um arquivo
aqui. Ordem **core-first** — núcleo determinístico (motor/formatador) antes das
bordas (Supabase/auth/UI), respeitando os módulos profundos do `CLAUDE.md` local,
não o tracer-bullet UI-first do skill.

## Ordem e dependências

```
01 config ─┬─> 02 motor-núcleo ─┬─> 03 motor-bordas ─┐
           │                    └─> 04 formatador ───┤
           ├─> 05 mapeador (mock) ───────────────────┼─> 08 ui-captura ─┐
           └─> 06 persistência ──> 07 auth ──────────┴─> 09 ui-geração ─┴─> 10 deploy
```

| # | Slice | Tipo | Bloqueado por |
|---|---|---|---|
| 01 | [Config dos projetos](01-config-projetos.md) | AFK | — |
| 02 | [Motor — núcleo](02-motor-nucleo.md) | AFK | 01 |
| 03 | [Motor — bordas](03-motor-bordas.md) | AFK | 02 |
| 04 | [Formatador](04-formatador.md) | AFK | 02 |
| 05 | [Mapeador semântico](05-mapeador-semantico.md) | AFK | 01 |
| 06 | [Persistência Supabase](06-persistencia-supabase.md) | AFK | 01 |
| 07 | [Auth usuário único](07-auth-usuario-unico.md) | HITL | 06 |
| 08 | [UI captura](08-ui-captura.md) | AFK | 05, 06, 07 |
| 09 | [UI geração](09-ui-geracao.md) | AFK | 03, 04, 06, 07 |
| 10 | [Deploy online](10-deploy-online.md) | AFK | 08, 09 |

## Decisão pendente embutida

Provider de LLM (Claude vs OpenAI) + SDK (direta vs Vercel AI SDK) — HITL, vive no
cabeçalho do slice 05. Trava só a chamada real; os testes mockados não dependem.

## Primeira jogada de implementação

Slice **01** (config) → **02** (motor núcleo, TDD). O motor é o coração dos testes.
