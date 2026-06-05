# 10 — Deploy online (Vercel)

> Tipo: AFK · Fonte: PRD User Story 24 ("ficar online e acessível")

## What to build

Pôr o app no ar na Vercel, acessível de qualquer lugar, com as variáveis de
ambiente (Supabase, chave do provider de LLM) configuradas no projeto da Vercel.
Sinal de pronto do produto inteiro (CONTEXT): online, funciona, Pedro usa.

## Acceptance criteria

- [ ] App deployado na Vercel e acessível por URL pública
- [ ] Variáveis de ambiente (Supabase, LLM) configuradas no ambiente da Vercel,
      fora do versionamento
- [ ] Login fechado funciona em produção (só Pedro entra)
- [ ] Fluxo ponta a ponta em produção: captura semanal → geração do relatório
- [ ] Verificado: um relatório real gerado em produção bate com o esperado

## Blocked by

- 08 — UI de captura semanal + confirmação
- 09 — UI de geração do relatório
