# ADR-0003 — Auth por magic link via code flow (template padrão, sem SMTP)

- **Status:** aceito
- **Data:** 2026-06-05
- **Decisores:** Pedro (curadoria); decisão emergiu na implementação do slice 07.

## Contexto

Login de usuário único por magic link (slice 07). O padrão oficial do
`@supabase/ssr` para App Router usa `token_hash` + `verifyOtp` numa rota
`/auth/confirm`, o que exige **editar o template de e-mail** (apontar o link para
`/auth/confirm?token_hash=…`).

No plano free do Supabase, editar templates de e-mail **exige SMTP próprio**
("Set up custom SMTP to edit templates"). Sem SMTP, o template fica travado no
padrão, cujo botão usa `{{ .ConfirmationURL }}`.

## Decisão

**Usar o code flow (PKCE) com o template padrão.** O `signInWithOtp` aponta
`emailRedirectTo` para `/auth/callback`; o `ConfirmationURL` padrão devolve um
`?code=` nessa rota; o Route Handler troca por sessão via
`exchangeCodeForSession`. Zero edição de template, zero SMTP.

## Alternativas rejeitadas

- **token_hash + verifyOtp (padrão da doc).** Rejeitada: exige editar o template,
  bloqueado sem SMTP no plano free.
- **Configurar SMTP próprio agora.** Rejeitada: setup externo desproporcional para
  um app de usuário único; o code flow resolve sem isso.

## Consequências

- A trava de segurança **não** muda: continua `getUser()` em toda Server
  Action/Server Component (CVE-2025-29927); o middleware só refresca sessão.
- O magic link é de uso único — reabrir um link já gasto cai em "Link inválido ou
  expirado" por construção (não é bug).
- Se um dia houver SMTP/domínio próprio, dá para migrar para `token_hash` sem
  mexer na fronteira de auth — só a rota e o template.
- As Redirect URLs do Supabase precisam conter a origem do app
  (`http://localhost:3000/**` em dev; o domínio no deploy).
