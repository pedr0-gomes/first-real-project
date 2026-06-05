# CONTEXT.md — first-real-project

Última atualização: 2026-06-05 (slice 03 fechado)

## O que é

Primeiro produto técnico end-to-end do Pedro (zero na stack, aprende
construindo). App web onde ele captura atividades soltas durante a semana e,
no fim do mês, gera relatórios de frequência no template fixo de duas
instituições. Critério: pequeno pra terminar em semanas, útil pra usar de
verdade, não-clone. Sinal de pronto: online, funciona, Pedro usa.

**Motivação:** hoje Pedro faz isso via skills do Claude que queimam token e
poluem contexto. O produto externaliza isso.

## Arquitetura decidida (via /investigar)

- **Motor + config.** Um motor comum (dividir mês em semanas seg-dom, fechar
  carga semanal exata, preencher com atividade-coringa, sinalizar
  inconsistências) + um arquivo de config por projeto. Projeto futuro =
  escrever config, não recodar. **Validado no grill:** a divergência de semana
  parcial entre os dois projetos virou parâmetro de config, não `if` no motor.
- **LLM num ponto só, fechado.** Restrito a NL→structured na captura: texto
  livre → atividades reais + horas sugeridas, com confirmação humana. O motor
  (determinístico) faz todo o resto — dividir o mês, somar, fechar a carga com
  o coringa, validar. O LLM nunca vê o número da carga.
- **Captura própria no Supabase, sem fontes externas.** O produto é a superfície
  de captura. **Calendar e Notion cortados** (as skills atuais liam de lá): os
  horários fixos viram `gradeSemanal` na config; o resto entra por texto livre.

**Stack:** Next.js (App Router) + Supabase (Postgres + auth) + Vercel + API de
LLM (Claude ou OpenAI — não decidido).

## Spec dos templates (as duas instituições)

Fonte canônica: as duas skills de relatório do Pedro (LoOBI e monitoria
CC0002), coladas na sessão de 2026-06-04/05. Formato de saída comum:
`I SEMANA: DD/MM - [descrição oficial] - Xh; ...` (semana seg-dom, soma exata).

- **LoOBI (extensão):** 8h/semana. Vocabulário: Blog, Podcast, Reunião,
  Pesquisa, Outros. Regra especial: categoria **Instagram é descartada** e as
  horas compensadas com "Estudo e planejamento de atividades do projeto LoOBI".
  Semana parcial fecha 8h normal.
- **Monitoria CC0002 (Cálculo I):** 12h/semana. Vocabulário: Plantão, Reunião,
  Material de Apoio, Lista Comentada, Videoaula, Classroom, Outros. Coringa:
  "Estudo e aplicação de método e técnicas de ensino/aprendizagem". Semana
  parcial = proporcional (~4-5h) e sinalizar.

## Onde estamos — esteira Construir

`Idea ✓ → Research ✓ → (opc) Prototype → PRD → Kanban → Implementation → QA`

- **Idea ✓** — fechada no /investigar.
- **Research ✓** — `.claude/research/primeiro-produto-web.md`.
- **Grill ✓** — 5 branches + 2 decisões novas fechados (ver "Decisões do
  grill-me"). 2026-06-05.
- **PRD ✓** — `docs/PRD.md` (25 user stories, módulos, testes, escopo). 2026-06-05.
- **Esqueleto ✓** — git (branch main), `.gitignore`, `CLAUDE.md` local, `README.md`,
  `docs/adr/0001`. Commit inicial `1e17860`. 2026-06-05.
- **Kanban ✓** — PRD fatiado em 10 vertical slices core-first em `docs/issues/`
  (índice + grafo em `docs/issues/README.md`). 2026-06-05.
- **Slice 01 ✓** — config implementada: tipo `ProjetoConfig` + LoOBI/CC0002, TS
  puro em `src/` (sem scaffold Next — borda vem nos slices de UI/persistência),
  type-check limpo. Grades fixas preenchidas do Calendar e confirmadas: LoOBI 2
  reuniões/sem; CC0002 6h de plantão/sem. Commit `75bc82d`. 2026-06-05.
- **Slice 02 ✓** — motor núcleo (TDD, vitest), `src/motor/`. `consolidar(atividades,
  config, mes)` puro: particiona o mês em semanas seg→dom, expande grade + soma
  reais, fecha ΔH com coringa (uniforme nos úteis livres → resto recuando da sexta,
  tampado pelo teto soft → transbordo pro FDS se `aceitaFimDeSemana`). 7 testes
  verdes; teto exercitado com teste real (2 ciclos passaram green-first por
  construção adiantada no ciclo 2 — lição: código mínimo). Commit `0a756c3`. 2026-06-05.
- **Slice 03 ✓** — motor bordas (TDD, vitest), `src/motor/`. Alvo por semana
  (`cheia` → carga; `proporcional` → `round(carga × diasÚteisNoMês / 5)`) + 4 flags
  na saída (`sem-atividade-real`, `parcial-proporcional`, `acima-do-alvo`,
  `carga-incompleta`). Fechou o transbordo soft puro do 02: o resto que o coringa
  não aloca vira flag `carga-incompleta` em vez de sumir. **Decisão nova:** recorte
  ao mês (`entradas ⊆ mês`) — grade/real/coringa só em dias dentro do mês; o
  proporcional forçou a encarar as pontas seg-dom que extravasam. Registrado em
  `docs/adr/0002`. **Lição:** o teto soft não corta a base uniforme do coringa, só
  o resto derramado (decisão #4 do grill) — meu 1º teste mentia, o motor estava
  certo. 8 testes novos, 15 verdes no total, typecheck limpo. 2026-06-05.
- **Próxima jogada:** **slice 04** (formatador) — `Consolidacao` → string no
  template de cada instituição. Puro, AFK, TDD; assume o invariante `entradas ⊆ mês`
  do ADR-0002. Motor agora fechado (núcleo 02 + bordas 03). Decisão HITL pendente
  (provider LLM + SDK) vive no slice 05, não trava.
- **Transversal ✓** — registrado no sistema global em 2026-06-05: entrada na
  database [Construções](https://www.notion.so/376ab645e3bb81f6935fd72700848367)
  (status ativo) + ponteiro no `CONTEXT.md` global.

## Decisões do grill-me (2026-06-05)

1. **Captura semanal por texto livre + LLM (NL→structured).** Pedro registra
   1x/semana em texto livre; o LLM extrai as atividades reais e sugere horas;
   tela de confirmação antes de salvar. O LLM nunca soma, nunca fecha carga,
   nunca inventa — só estrutura o que Pedro escreveu.
2. **Calendar cortado.** Horários fixos viram `gradeSemanal` na config
   (dia → categoria → horas). Mata integração externa, auth e latência.
3. **Grade fixa pré-preenche; cancelar é manual; texto livre só adiciona.**
   Encurtar/cancelar um item fixo = edição manual na tela da semana. O texto
   livre é aditivo (nunca NL→diff — é onde o LLM mais erra).
4. **O motor fecha a carga com o coringa** (não o LLM). Grade cobre só o
   realmente fixo (folga proposital); o coringa é recorrente. Distribui
   uniforme nos dias úteis livres, resto na sexta. Teto diário `soft`
   (`tetoHorasDiaCoringa`) guia o coringa, nunca bloqueia atividade real.
5. **Semana parcial = config** `semanaParcial: 'cheia' | 'proporcional'`.
   Proporcional = `round(cargaSemanal × diasÚteisNoMês / 5)` + flag de revisão.
   (LoOBI cheia; monitoria proporcional.) — validou motor+config: virou
   parâmetro, não `if` no motor.
6. **Horas têm três fontes:** grade fixa → config; adição → LLM extrai do texto,
   fallback default por categoria, editável na confirmação; coringa → motor.
7. **Instagram = categoria reconhecida-mas-descartada** no vocabulário (LoOBI).
   Reconhecida (não vira "Outros"), descartada na captura, avisada na
   confirmação. Compensação é emergente (motor fecha com coringa). NÃO é
   `diretrizEspecial`.

## Sketch de módulos (a confirmar no PRD)

- **Motor de consolidação** *(fundo, puro, testável)* — atividades + config +
  mês → estrutura semanal com coringa e flags. Fecha a carga (o LLM não).
- **Formatador de relatório** *(fundo, puro)* — estrutura → string no template
  da instituição.
- **Mapeador semântico** — texto livre → atividades reais estruturadas
  (categoria + horas sugeridas), descartando categorias excluídas. Wrapper de
  LLM, mockável.
- **Config dos projetos** — TS estático (LoOBI, CC0002). Shape fechado no grill:
  `cargaSemanal`, `vocabulario` (com flag de categoria descartada),
  `gradeSemanal` (dia→categoria→horas), `defaultHorasPorCategoria`,
  `atividadeCoringa`, `semanaParcial: 'cheia'|'proporcional'`,
  `tetoHorasDiaCoringa`, `aceitaFimDeSemana`. Substitui o `diretrizesEspeciais`
  do dump da pesquisa.
- **Persistência (Supabase)** — CRUD + RLS. Só atividades reais viram linha
  (grade fixa e coringa são derivados de config/motor, não persistidos).
- **Auth + rotas/UI** — usuário único; captura (texto livre) + **tela de
  confirmação da semana** (revisar atividades extraídas, horas, descartes;
  editar/cancelar itens da grade) + dashboard.

**Escopo de teste proposto:** motor + formatador a fundo (tdd); mapeador por
mock; persistência/UI fora do unitário.

## Pendências de infra

- **Git ✓, esqueleto ✓** (commit `1e17860`). **Sem issue tracker** — decidido:
  PRD em `docs/PRD.md`; o `/to-issues` salvará as issues como arquivos, não em
  tracker externo.
