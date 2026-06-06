# CONTEXT.md — first-real-project

Última atualização: 2026-06-06 (slice 08 fatia mínima ✓ — captura por texto livre via Gemini 2.5-flash, **verificada em produção ponta a ponta**. Produto completo: 10/10 slices no ar.)

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

**Stack:** Next.js (App Router) + Supabase (Postgres + auth) + Vercel + Gemini
`2.5-flash` (free tier, SDK `@google/genai`).

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
- **Slice 04 ✓** — formatador (TDD, vitest), `src/formatador/`. `formatar(consolidacao,
  config)` puro: `Consolidacao` → string no template exato. Cabeçalho `Relatório de
  Frequência — {nome} — {mês}/{ano}` + linha por semana (romano, `DD/MM`, `; `, `.`
  final). Descrição resolvida por `origem` (coringa → `atividadeCoringa`; grade/real →
  `vocabulario[cat].descricaoOficial`); **ordena entradas por data** (o motor empurra
  grade→real→coringa, não ordena). **Decisões:** cabeçalho incluído; horas com vírgula
  pt-BR (`1,5h`, inteiros sem decimal); flags fora da string (vivem na `Consolidacao`
  pra UI). Golden test por instituição batendo letra a letra com `docs/template/`.
  4 testes, 19 verdes. Commit `e17e1a2`. 2026-06-05.
- **Slice 05 ✓** — mapeador semântico (TDD, LLM mockado), `src/mapeador/`. `mapear(texto,
  config, cliente)` → `ResultadoMapeamento { atividades, descartes }`. **Fronteira LLM
  cravada (lei central):** `ClienteLLM = (prompt) => Promise<string>` ("boundary crua") —
  único ponto de LLM, injetável; prompt + parse + validação ficam DENTRO da unidade
  testada, só a chamada real depende do provider. Saída **sem data** (a data é atribuída
  na confirmação) + `fonteHoras: 'texto' | 'default'`. Regras nossas testadas: parse JSON,
  múltiplas atividades/frase, fallback default de horas, Instagram → `descartes`, categoria
  fora do vocabulário ignorada (não inventa). 5 testes, 24 verdes, typecheck limpo.
  **Pendências honestas:** (1) decisão HITL provider+SDK (Claude `haiku` vs OpenAI
  `gpt-4o-mini`; SDK direta vs Vercel AI SDK) — não trava, liga junto da chamada real/UI;
  critério: modelo pequeno por custo. (2) parse mínimo de propósito (sem tratar cercas
  markdown ` ```json `) — endurecer com o adaptador real. 2026-06-05.
- **Slice 06 ✓ (verificado)** — persistência Supabase, primeira borda de
  infra. Scaffold Next 16 (App Router em `src/app/`, manual em vez de `create-next-app` pra
  preservar o tsconfig estrito); clientes `@supabase/ssr` server (cookies async) + browser
  com publishable key (RLS aplicada, secret key não usada); schema `atividades` + RLS
  owner-only (`USING` + `WITH CHECK`) **aplicado via SQL Editor** — o `db push` da CLI não
  alcança (o terminal do Pedro e o host das ferramentas são filesystems separados; a migration
  fica no git como schema canônico, não como fonte aplicada); CRUD em Server Actions
  (`src/app/actions/atividades.ts`), todas via `getUser()` no servidor. Domínio `Atividade`
  estende `AtividadeReal` → alimenta o motor direto; mapa puro isola o snake_case. Commits
  `c033ed5`, `d85fac5`, `5e02a4f`. **Verificado** ponta a ponta: criar/listar/apagar pela
  `/atividades`, conferido no Table Editor que grava com o `user_id` certo. RLS isolando outro
  user não testada (usuário único; a trava real é o `getUser()` no servidor).
- **Slice 07 ✓** — auth magic link usuário único, **verificado funcionando** ponta a ponta.
  `signInWithOtp({ shouldCreateUser: false })` (cadastro fechado; conta criada à mão no
  dashboard); middleware refresca sessão + redireciona deslogado (UX), a trava real é
  `getUser()` em cada Server Component/Action. **Virada:** o plano free do Supabase não edita
  template de e-mail (exige SMTP) → code flow (`/auth/callback` + `exchangeCodeForSession`) no
  template padrão, em vez de `token_hash`/`verifyOtp`. Registrado em `docs/adr/0003`. Commits
  `ba8fa54`, `c655831`.
- **Caminho determinístico (UI) ✓** — entrada manual de atividade + lista
  (criar/listar/apagar), server-rendered **sem componente client** (troca de projeto = link
  `?projeto=`; categorias ativas saem da config no servidor; `<form>` → Server Action com
  validação server-side). Exercita o 06 ponta a ponta, sem LLM. Commit `e956a81`.
  **Reordenação:** geração (09) **antes** da captura por LLM (08) — a parte determinística
  (motor + formatador + persistência) já está pronta; o LLM é comodidade que entra depois. A
  decisão de provider LLM segue pendente, agora explicitamente atrás deste caminho.
- **Geração (slice 09) ✓** — tela `/relatorio` server-rendered: `listarAtividades` →
  `consolidar` → `formatar` → relatório no template + seção "Revisar" com as flags do motor.
  Mês via `?mes=YYYY-MM` (form GET, default mês corrente); o motor recorta ao mês (ADR 0002),
  então a lista inteira do projeto entra sem filtro. **1º relatório real saiu ponta a ponta**
  (Supabase → motor → formatador → tela).
- **Atalho de login pra dev** — `/auth/dev-login` (guardado por `NODE_ENV`, 404 fora de dev)
  loga sem e-mail, driblando o rate limit de e-mail do plano free do Supabase. Usa
  `service_role` (`SUPABASE_SECRET_KEY` no `.env.local`) + `verifyOtp(token_hash)`. **Lição:** o
  fluxo PKCE do app (ADR 0003) barra magic link gerado por admin — falta o `code_verifier` no
  browser; o `token_hash` via `verifyOtp` contorna sem tocar o fluxo de produção.
- **Deploy (slice 10) ✓** — app no ar na Vercel (`first-real-project-sable.vercel.app`,
  domínio público sem deployment protection). Só as 2 env vars do Supabase na Vercel
  (`SECRET_KEY` fica de fora — só serve ao dev-login, 404 em prod). Supabase auth: Site URL
  + Redirect URL (`/auth/callback`) apontando pro domínio (localhost mantido na allowlist pro
  dev). Login por magic link e relatório real **verificados em produção** ponta a ponta.
  **Lição:** o "Link inválido ou expirado" em prod era **link de uso único reaberto** (não
  prefetch de scanner) — bate com a consequência já prevista no ADR 0003. Clicar o link **uma
  vez, no mesmo browser** que o pediu (aba anônima separada perde o cookie do `code_verifier`
  PKCE). **Dívida anotada:** Next 16 deprecou `middleware` → renomear pra `proxy` (warning no
  build, não bloqueia). **Produto atinge o sinal de pronto: online, funciona, Pedro usa.**
- **Qualidade do output (pós-deploy) ✓** — 1º teste funcional do relatório real
  expôs vocabulário repetitivo e nominalizado (herdado das skills antigas; os
  testes unitários só checavam config↔golden, não a *qualidade* da frase).
  Vocabulário de LoOBI e CC0002 reescrito impessoal/enxuto, sem repetir o nome
  (vive no cabeçalho), sem placeholder vazando; termos de edital mantidos na
  monitoria. Aplicado em config + template + golden + PRD, 24 testes verdes, no ar
  na Vercel. Virou **padrão inegociável** no `CLAUDE.md` local ("Linguagem dos
  relatórios").
- **Captura por texto livre (slice 08, fatia mínima) ✓** — última peça do produto, comodidade
  sobre o caminho determinístico. **Decisão de provider:** Gemini `2.5-flash` (free tier, JSON
  mode) — **descartados** OpenAI/Claude por exigirem crédito pré-pago (o critério virou custo
  ZERO, não "desprezível"); SDK direta `@google/genai`. Adaptador real do `ClienteLLM` em
  `src/lib/llm/gemini.ts` (única borda que conhece o provider; o `mapeador` puro segue intocado,
  recebendo o cliente injetado). Fluxo `/captura` server-rendered (sem componente client): texto
  livre → `mapear` → confirmação (`/captura/confirmar`) com horas editáveis + aviso de descarte →
  salva **só atividades reais** (`textoBruto` guardado junto). Dados extração→confirmação por
  base64 na URL; nada vai ao banco antes de confirmar. **Verificado ponta a ponta** (local):
  Podcast extrai 2h do texto, Reunião cai no default da config, Instagram descartado, salvou em
  `/atividades`. Commit `7efa691`. **Lição (smoke test da conexão):** `gemini-2.0-flash` com cota
  grátis **zerada** nesta conta; `2.5-flash-lite` devolve horas como **string** (`"2h"`) →
  quebraria o motor; `2.5-flash` devolve número. **Conta:** chave criada com Gmail **pessoal** — a
  conta da UFCA (Workspace) bloqueia criar projeto no Google Cloud.
- **Ficou pra depois (slice 08 completo):** grade fixa pré-preenchida na semana + editar/cancelar
  item fixo na mão. A fatia mínima entrega o atalho de digitação; o resto é UI, não LLM.
- **Deploy do slice 08 ✓** — `GEMINI_API_KEY` salva na Vercel + `git push`
  (`8d51041..dd24033`) em 2026-06-06; deploy automático disparado. **Confirmado:** build verde
  (`/captura` → 307 → `/login`, `/login` → 200) + `/captura` **testada em produção ponta a ponta**
  (login magic link → texto livre → Gemini extraiu horas + descartou Instagram → salvou em
  `/atividades`). A `GEMINI_API_KEY` na Vercel está correta — o caminho do LLM em prod fechou.
  **Pré-requisito de runtime local:** `.env.local` com URL + publishable key + `SUPABASE_SECRET_KEY`
  (atalho de dev) + `GEMINI_API_KEY`.
- **Produto completo ✓** — todos os 10 slices no ar e exercitados em produção. Daí em diante é uso
  real + (se quiser) o slice 08 completo (grade fixa pré-preenchida + editar/cancelar item na mão)
  e a dívida da chave abaixo.
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
- **Dívida — rotacionar `GEMINI_API_KEY` (2026-06-06).** O valor da chave apareceu
  em texto puro no chat (seleção do `.env.local`) → tratada como comprometida.
  Risco baixo (free tier, sem cartão; pior caso é queimar a cota grátis), por isso
  não-urgente. Quando voltar à Vercel por outro motivo: gerar nova no Google AI
  Studio → trocar no `.env.local` + Vercel → redeploy → só então apagar a antiga.
  Hábito firmado: nunca colar chave no chat.
