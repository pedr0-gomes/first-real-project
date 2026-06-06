# first-real-project

Gerador de relatórios mensais de frequência. Pedro registra suas atividades em
**texto livre, uma vez por semana**, e o app gera o relatório mensal no template
exato exigido por cada vínculo (monitoria CC0002 — 12h/sem; extensão LoOBI —
8h/sem), pronto pra copiar e enviar.

É o primeiro produto web end-to-end do Pedro — zero na stack, aprende
construindo. Critério de pronto: **online, funciona, Pedro usa de verdade.**

## Como funciona

Uma fronteira rígida divide a inteligência:

- **O LLM** lê o texto livre e o estrutura em atividades reais (categoria +
  horas sugeridas). Só isso.
- **O motor determinístico** faz toda a aritmética: divide o mês em semanas,
  soma, fecha a carga exata com uma atividade-coringa, aplica as regras de cada
  instituição e sinaliza inconsistências.

Cada vínculo é descrito por uma **config estática**. Vínculo novo = escrever
config, não recodar.

## Stack

Next.js (App Router) · Supabase (Postgres + auth) · Vercel · Gemini 2.5-flash.

## Documentos

- [`CONTEXT.md`](CONTEXT.md) — estado atual, decisões, próxima jogada.
- [`docs/PRD.md`](docs/PRD.md) — especificação do produto.
- [`docs/issues/`](docs/issues/) — o PRD fatiado em vertical slices (o Kanban do projeto).
- [`docs/adr/`](docs/adr/) — decisões arquiteturais.
- [`docs/template/`](docs/template/) — fonte canônica dos dois relatórios.

## Estado

**No ar e completo.** Os 10 vertical slices estão em produção na Vercel e
exercitados ponta a ponta: núcleo puro testado (config + motor + formatador +
mapeador), persistência e auth no Supabase, captura manual **e por texto livre
(LLM)**, e geração do relatório. O critério de pronto foi atingido — online,
funciona, Pedro usa de verdade, no ritmo **capturar 1x/semana → gerar no fim do
mês**.

O estado vivo — próxima jogada, decisões em curso, escopo adiado — é do
[`CONTEXT.md`](CONTEXT.md); este README não o duplica.
