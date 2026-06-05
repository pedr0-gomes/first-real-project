# 07 — Auth usuário único

> Tipo: HITL · Fonte: PRD §"Módulo: Auth + rotas/UI" + §Padrão de segurança

## What to build

Autenticação de usuário único (só Pedro), cadastro fechado no Supabase. A peça
crítica é a **defesa em profundidade contra a CVE-2025-29927**: validar
identidade em **toda** Server Action e Route Handler com
`supabase.auth.getUser()` — nunca confiar só no middleware, nunca usar
`getSession()` pra autorização.

HITL porque envolve setup de auth no Supabase e a decisão de como fechar o
cadastro (sem signup público).

## Acceptance criteria

- [ ] Cadastro fechado: não há fluxo de signup público; só Pedro tem conta
- [ ] Login funciona; rotas protegidas exigem sessão
- [ ] **Toda** Server Action / Route Handler valida com `supabase.auth.getUser()`
- [ ] Nenhuma autorização depende só do middleware nem de `getSession()`
- [ ] Verificado manualmente: requisição sem sessão válida é rejeitada na borda

## Blocked by

- 06 — Persistência (Supabase) (compartilha o projeto Supabase)
