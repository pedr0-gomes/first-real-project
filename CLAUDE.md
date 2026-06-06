# CLAUDE.md — first-real-project

App web que gera relatórios mensais de frequência (monitoria CC0002, extensão
LoOBI) a partir de captura semanal em texto livre.

## Mapa dos documentos (ler sob demanda, não tudo de uma vez)

- `CONTEXT.md` — estado operacional, decisões em curso, próxima jogada. **Ler na
  entrada de cada sessão.**
- `docs/PRD.md` — a spec do produto (problema, solução, módulos, testes, escopo).
- `docs/adr/` — decisões arquiteturais com data e justificativa. Respeitar.
- `docs/template/` — fonte canônica dos dois relatórios (vocabulário oficial,
  carga, coringa de cada instituição).

## Dinâmica deste projeto

Contexto **pessoal**: Pedro traz a ideia, muitas vezes sem saber implementar.
Claude executa **e explica junto** — Pedro aprende construindo, partindo do zero
nesta stack. Antes de qualquer ação, explicar o que vai acontecer e por quê.
Uma coisa por vez.

## Stack

Next.js (App Router, React Server Components) + Supabase (Postgres + auth) +
Vercel + Gemini `2.5-flash` (free tier, SDK `@google/genai`). TypeScript.
Tailwind inline.

## Padrões inegociáveis

- **Fronteira LLM × código (lei central).** O LLM faz só NL→structured na
  captura: texto livre → atividades reais + horas sugeridas. Nunca soma, nunca
  fecha carga, nunca inventa atividade. Toda aritmética e regra é do **motor
  determinístico**.
- **Motor + config.** Lógica comum no motor; o que varia entre instituições mora
  em config estática por projeto. Projeto novo = escrever config, não recodar.
  Se uma divergência exigir `if projeto === X` no motor, o caminho está errado.
- **Módulos profundos.** Motor e formatador são puros, testáveis isolados,
  interface estável. Efeito colateral (Supabase, auth, UI) fica nas bordas.
- **Testes.** Motor e formatador a fundo (TDD); mapeador com LLM mockado;
  persistência/UI fora do unitário. Testar comportamento externo, não
  implementação. Runner: `npm test` (vitest), `npm run test:watch` no loop
  red-green; `npm run typecheck` (tsc) pra checar tipos.
- **Segurança.** Validar identidade em toda Server Action / Route Handler com
  `supabase.auth.getUser()` — nunca só no middleware (CVE-2025-29927).
- **Linguagem dos relatórios.** Descrições do `vocabulario` e do
  `atividadeCoringa`: impessoais e enxutas, sem repetir o nome do projeto (vive
  no cabeçalho do relatório) nem nominalizações de ata, sem placeholder no texto
  final. Exceção: termos literais de edital/norma, mantidos quando a fidelidade
  importa mais que o estilo (ex.: monitoria CC0002). O motor escolhe categoria e
  horas; a frase vem pronta da config — variar frase a frase exigiria o LLM
  inventar texto, o que viola a fronteira central.
