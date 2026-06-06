# 10 — Deploy online (Vercel)

> Tipo: AFK · Fonte: PRD User Story 24 ("ficar online e acessível")

## What to build

Pôr o app no ar na Vercel, acessível de qualquer lugar, com as variáveis de
ambiente (Supabase, chave do provider de LLM) configuradas no projeto da Vercel.
Sinal de pronto do produto inteiro (CONTEXT): online, funciona, Pedro usa.

## Acceptance criteria

- [x] App deployado na Vercel e acessível por URL pública
      (`first-real-project-sable.vercel.app`, domínio público sem deployment protection)
- [x] Variáveis de ambiente configuradas no ambiente da Vercel, fora do
      versionamento — só as 2 do Supabase (`NEXT_PUBLIC_SUPABASE_URL`,
      `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). LLM fica pro slice 08;
      `SUPABASE_SECRET_KEY` NÃO vai pra produção (só serve ao dev-login, 404 fora de dev).
- [x] Login fechado funciona em produção (só Pedro entra) — magic link verificado
      ponta a ponta; Site URL + Redirect URL (`/auth/callback`) configurados no Supabase
- [x] Fluxo ponta a ponta em produção: captura manual → geração do relatório
- [x] Verificado: um relatório real gerado em produção bate com o esperado

## Blocked by

- ~~08 — UI de captura semanal + confirmação~~ (destravado pela reordenação: a
  captura **manual** determinística cobre o fluxo; o LLM do 08 entra depois)
- 09 — UI de geração do relatório ✓

## Status: feito (2026-06-06)

Online, funciona, Pedro usa — sinal de pronto do produto inteiro. Lição do deploy:
o "Link inválido ou expirado" no login era **link de uso único reaberto** (não
prefetch de scanner) — confirmou a consequência já prevista no ADR 0003. Pedir o
link e clicar **uma vez, no mesmo browser** que pediu (sem aba anônima separada,
onde o cookie do `code_verifier` PKCE não acompanha o clique).
