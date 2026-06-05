# PRD — Gerador de Relatórios Mensais de Frequência

> Status: ready-for-agent · Data: 2026-06-05 · Fonte: grill-me + destilação desta sessão.
> Tracker do projeto ainda não existe — este PRD vive em `docs/PRD.md` (decisão registrada no CONTEXT.md).

## Problem Statement

Pedro tem dois vínculos que exigem relatório mensal de frequência num template
fixo (monitoria CC0002, 12h/semana; extensão LoOBI, 8h/semana). Hoje ele gera
esses relatórios através de skills do Claude que leem Notion e Google Calendar a
cada execução — o que queima tokens, polui o contexto e amarra uma tarefa
recorrente a uma ferramenta de propósito geral. O trabalho real (atender alunos,
produzir conteúdo) acontece de forma irregular durante a semana, mas o relatório
exige que **cada semana feche a carga horária exata — nem mais, nem menos** — no
vocabulário oficial de cada instituição. Fechar essa conta à mão, mês a mês, nos
dois projetos, é repetitivo e propenso a erro.

## Solution

Um app web de usuário único onde Pedro captura suas atividades em **texto livre,
uma vez por semana**, e gera o relatório mensal no template exato de cada
instituição, pronto pra copiar e enviar.

A inteligência fica dividida por uma fronteira rígida:

- **O LLM** lê o texto livre e o estrutura (NL→structured): identifica as
  atividades reais que Pedro descreveu, mapeia pra categoria do vocabulário
  oficial e sugere horas. Nada além disso — nunca soma, nunca fecha carga,
  nunca inventa atividade.
- **O motor determinístico** faz toda a aritmética e regra de negócio: divide o
  mês em semanas (seg–dom), soma as horas reais, completa o que falta com a
  atividade-coringa até fechar a carga exata, aplica regras de semana parcial e
  levanta flags de inconsistência.

Cada projeto é descrito por um **arquivo de config estático**. Adicionar um
terceiro vínculo no futuro = escrever uma config, não recodar.

## User Stories

1. Como Pedro, quero registrar minha semana em texto livre, para não preencher
   formulário campo a campo.
2. Como Pedro, quero registrar só uma vez por semana, para não ter atrito diário.
3. Como Pedro, quero que cada projeto tenha uma grade de horários fixos
   pré-configurada, para não redigitar o que acontece toda semana (ex: plantão
   de terça).
4. Como Pedro, quero que minha grade fixa apareça pré-preenchida na semana, para
   só precisar registrar o que foge do padrão.
5. Como Pedro, quero adicionar atividades novas (não-fixas) descrevendo-as em
   texto livre, para capturar o trabalho que varia semana a semana.
6. Como Pedro, quero que o LLM extraia várias atividades de uma frase só
   (ex: "fiz 2 listas e atendi alunos"), para descrever a semana naturalmente.
7. Como Pedro, quero que o LLM sugira as horas de cada atividade a partir do que
   escrevi, para não ter que cravar números o tempo todo.
8. Como Pedro, quero que, quando eu não disser as horas, o sistema use um padrão
   por categoria, para ter um palpite razoável de partida.
9. Como Pedro, quero revisar numa tela de confirmação tudo que o LLM extraiu
   antes de salvar, para corrigir erros de interpretação.
10. Como Pedro, quero editar as horas de qualquer atividade na confirmação, para
    ter a palavra final quando a estimativa estiver errada.
11. Como Pedro, quero cancelar ou encurtar manualmente um item da grade fixa
    (ex: feriado caiu na terça), para refletir o que de fato não aconteceu.
12. Como Pedro, quero que o sistema feche cada semana na carga exata exigida,
    para o relatório ser aceito pelo edital.
13. Como Pedro, quero que as horas que faltam sejam preenchidas com a atividade-
    coringa do projeto, para fechar a carga sem inventar atividade real.
14. Como Pedro, quero que o coringa seja distribuído de forma natural pelos dias
    úteis livres da semana, para o relatório não chamar atenção.
15. Como Pedro, quero que o coringa respeite um teto de horas/dia "de bom senso",
    para não empilhar 8h de estudo num dia só.
16. Como Pedro, quero que semanas parciais (pontas do mês) sigam a regra do
    projeto — fechar carga cheia (LoOBI) ou proporcional com aviso (monitoria) —
    para cada relatório obedecer seu edital.
17. Como Pedro, quero que o sistema sinalize semanas suspeitas (ex: zero
    atividade real, ou parcial proporcional) antes de eu enviar, para revisar
    o que precisa de atenção.
18. Como Pedro, quero que atividades de categoria proibida (Instagram, na LoOBI)
    sejam reconhecidas e descartadas, para não aparecerem no relatório.
19. Como Pedro, quero ser avisado na confirmação quando algo foi descartado por
    ser categoria excluída, para saber que foi de propósito e não um bug.
20. Como Pedro, quero gerar o relatório do mês inteiro no template exato da
    instituição, para copiar e colar no destino oficial.
21. Como Pedro, quero escolher o mês de referência ao gerar o relatório, para
    fechar o mês que eu precisar.
22. Como Pedro, quero alternar entre meus dois projetos (monitoria e LoOBI),
    para gerar o relatório certo de cada um.
23. Como Pedro, quero que só eu tenha acesso ao app, para meus dados ficarem
    privados (usuário único, cadastro fechado).
24. Como Pedro, quero que o app fique online e acessível, para usar de verdade,
    de qualquer lugar.
25. Como mantenedor futuro do projeto, quero adicionar um novo vínculo escrevendo
    apenas uma config, para não tocar no motor.

## Implementation Decisions

**Arquitetura geral.** Motor determinístico + config por projeto. LLM restrito a
um único ponto (captura). Stack: Next.js (App Router) + Supabase (Postgres +
auth) + Vercel + uma API de LLM. Fornecedor de LLM e SDK (direta vs Vercel AI
SDK) ainda não decididos — handoff para a implementação.

**Fronteira LLM × código (decisão central que justifica o produto).** O LLM faz
NL→structured: texto livre → lista de atividades reais (categoria + horas
sugeridas). Ele nunca soma, nunca vê o número da carga semanal, nunca fecha a
carga, nunca inventa atividade. Toda aritmética e regra é do motor.

**Módulo: Motor de consolidação** (deep, puro, testável). Entrada: atividades
reais + config do projeto + mês. Saída: estrutura semanal com coringa embutido e
flags de inconsistência. Responsabilidades:
- Particionar o mês em semanas seg→dom (incluindo dias de ponta no mês vizinho,
  conforme template).
- Somar horas reais por semana.
- Calcular ΔH = carga-alvo − reais e completar com a atividade-coringa.
- Distribuir o coringa uniforme nos dias úteis (seg–sex) sem atividade real;
  resto do arredondamento no último dia útil (sexta); respeitar
  `tetoHorasDiaCoringa` (soft — guia o coringa, nunca bloqueia atividade real);
  ir pro fim de semana só se `aceitaFimDeSemana`.
- Semana parcial conforme `semanaParcial`: `'cheia'` fecha carga normal;
  `'proporcional'` usa `round(cargaSemanal × diasÚteisNoMês / 5)` e emite flag de
  revisão.
- Emitir flags (semana com zero atividade real, parcial proporcional, carga real
  acima do alvo — neste caso sem correção automática, só alerta).

**Módulo: Formatador de relatório** (deep, puro). Entrada: estrutura semanal.
Saída: string no template da instituição
(`I SEMANA: DD/MM - [descrição oficial] - Xh; ...`, semanas numeradas em romano).

**Módulo: Mapeador semântico** (wrapper de LLM, mockável). Entrada: texto livre +
config (vocabulário). Saída: atividades estruturadas (categoria + horas
sugeridas). Descarta categorias marcadas como excluídas no vocabulário (não as
converte em "Outros"). Prompt enxuto: só o vocabulário do projeto + o texto.

**Módulo: Config dos projetos** (TS estático no repo). Shape fechado no grill:
- `cargaSemanal: number`
- `vocabulario` — categorias com descrição oficial e flag de descarte
  (ex: Instagram na LoOBI: reconhecida, mas descartada)
- `gradeSemanal` — lista de itens fixos (diaDaSemana → categoria → horas)
- `defaultHorasPorCategoria` — fallback quando o texto não informa horas
- `atividadeCoringa` — descrição oficial do preenchimento
  (monitoria: "Estudo e aplicação de método e técnicas de ensino/aprendizagem";
  LoOBI: "Estudo e planejamento de atividades do projeto LoOBI")
- `semanaParcial: 'cheia' | 'proporcional'`
- `tetoHorasDiaCoringa: number`
- `aceitaFimDeSemana: boolean`

Este shape **substitui** o `diretrizesEspeciais` do dump da pesquisa, que não
cobria a exclusão de categoria.

**Módulo: Persistência (Supabase).** CRUD + RLS. **Só atividades reais viram
linha no banco.** Grade fixa e coringa são derivados (config + motor) em tempo de
geração, não persistidos. Schema base: tabela de atividades com `id`, `user_id`
(FK → auth.users, ON DELETE CASCADE), `project_id` (= chave da config), `date`,
`raw_text`, `mapped_activity`, `category`, `hours` (CHECK > 0), `created_at`.
RLS habilitado, policy `FOR ALL TO authenticated USING auth.uid() = user_id`.
Usar chaves novas do Supabase (`sb_publishable_` / `sb_secret_`).

**Módulo: Auth + rotas/UI.** Usuário único (cadastro fechado no Supabase).
Telas: captura por texto livre da semana → **tela de confirmação da semana**
(revisar atividades extraídas, editar horas, ver descartes, editar/cancelar itens
da grade fixa) → dashboard/geração do relatório (escolher mês e projeto, exibir
relatório em bloco de código pra copiar). Defesa em profundidade contra
CVE-2025-29927: validar identidade em toda Server Action / Route Handler com
`supabase.auth.getUser()`, nunca só no middleware nem via `getSession()`.

**Fluxo de captura.** Cadência semanal. A semana abre pré-preenchida com a grade
fixa. Pedro (a) edita/cancela itens fixos manualmente e (b) descreve atividades
novas em texto livre → LLM estrutura → tela de confirmação → salva só as reais.
O motor + coringa entram na geração do relatório, não na captura.

## Testing Decisions

**O que faz um bom teste:** exercita comportamento externo do módulo (entrada →
saída observável), não detalhe de implementação. Para os módulos puros, isso é
natural — alimenta-se config + atividades + mês e verifica-se a estrutura/string
de saída.

**Módulos testados a fundo (TDD, red-green-refactor):**
- **Motor de consolidação** — coração dos testes. Casos: semana cheia só com
  grade fixa; semana que precisa de coringa; distribuição do coringa em dias
  úteis livres; resto de arredondamento na sexta; teto diário do coringa;
  semana parcial `'cheia'` vs `'proporcional'` (com a fórmula e a flag); carga
  real acima do alvo (alerta, sem corte); flag de semana com zero atividade.
- **Formatador de relatório** — entrada estruturada conhecida → string esperada
  no template exato (numeração romana, `DD/MM`, `;` entre entradas, descrição
  oficial).

**Módulo testado com mock:**
- **Mapeador semântico** — LLM mockado. Testa-se a *nossa* lógica em torno dele:
  parsing do retorno em atividades estruturadas e descarte de categoria excluída
  (Instagram → some, não vira "Outros"). Não se testa o LLM em si.

**Fora do teste unitário:** Persistência (Supabase), Auth e UI — efeito
colateral e infra, validados manualmente / no uso real.

**Prior art:** nenhum — é o primeiro código do projeto. Os testes do motor e do
formatador estabelecem o padrão para os próximos.

## Out of Scope

- Integração com Google Calendar e Notion (cortada de propósito; a captura
  própria substitui).
- Multiusuário, papéis, compartilhamento (usuário único).
- NL→diff: o texto livre não cancela/altera a grade fixa por linguagem natural
  (isso é edição manual). O LLM só adiciona.
- LLM fechando carga, somando horas ou inventando atividade (proibido por
  design).
- Otimizações de escala/sênior, RAG, agentes, LangChain.
- Envio automático do relatório (e-mail/SIGAA). O app exibe pra copiar; o envio
  é manual.
- Painel admin de config (config é arquivo estático versionado).

## Further Notes

- **Pendência de infra, pré-implementação:** o projeto ainda não tem git, nem
  CLAUDE.md local, nem `docs/adr/`. Montar o esqueleto antes da esteira de
  implementação girar.
- **Decisões deixadas pra implementação:** fornecedor de LLM (Claude
  `claude-haiku` vs OpenAI `gpt-4o-mini`); SDK direta vs Vercel AI SDK; modelo
  pequeno por custo (chamar o LLM só na captura, salvar o resultado → custo zero
  nas telas seguintes).
- **Fontes canônicas dos templates:** `docs/template/monitoria.md` e
  `docs/template/extensão.md` (vocabulário oficial, carga, coringa de cada
  projeto).
- **Atenção herdada da pesquisa:** o dump de research não tem proveniência
  rastreável; tratar afirmações técnicas (chaves Supabase, CVE) como a verificar
  na implementação.
