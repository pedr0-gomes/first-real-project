# 06 — Persistência (Supabase)

> Tipo: AFK · Verificação manual (fora do teste unitário) · Fonte: PRD §"Módulo: Persistência"

## What to build

Schema + RLS + CRUD das atividades no Supabase. **Só atividades reais viram linha
no banco** — grade fixa e coringa são derivados (config + motor) em tempo de
geração, nunca persistidos.

Schema base — tabela de atividades:

- `id`
- `user_id` (FK → `auth.users`, `ON DELETE CASCADE`)
- `project_id` (= chave da config; liga a linha ao vínculo)
- `date`
- `raw_text` (o que Pedro escreveu)
- `mapped_activity` (atividade estruturada pelo mapeador)
- `category`
- `hours` (CHECK > 0)
- `created_at`

RLS habilitado, policy `FOR ALL TO authenticated USING auth.uid() = user_id`.
Usar as chaves novas do Supabase (`sb_publishable_` / `sb_secret_`).

> Herdado da pesquisa: tratar as afirmações sobre chaves Supabase como
> **a verificar** na implementação (dump sem proveniência rastreável).

## Acceptance criteria

- [ ] Tabela criada com todas as colunas e o CHECK `hours > 0`
- [ ] FK `user_id → auth.users` com `ON DELETE CASCADE`
- [ ] RLS habilitado; policy restringe a `auth.uid() = user_id`
- [ ] CRUD de atividade real funciona ponta a ponta (criar/ler/editar/apagar)
- [ ] Grade fixa e coringa **não** são persistidos (confirmar no schema/uso)
- [ ] Verificado manualmente: outro `user_id` não enxerga linhas alheias

## Blocked by

- 01 — Config dos projetos (define `project_id`)
