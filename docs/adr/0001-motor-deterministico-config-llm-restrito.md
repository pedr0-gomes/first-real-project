# ADR-0001 — Motor determinístico + config, LLM restrito à captura

- **Status:** aceito
- **Data:** 2026-06-05
- **Decisores:** Pedro (curadoria), via grill-me desta sessão.

## Contexto

O produto gera relatórios mensais de frequência num template fixo, onde **cada
semana precisa fechar a carga horária exata** (12h monitoria, 8h LoOBI) no
vocabulário oficial de cada instituição. O trabalho real acontece de forma
irregular; o relatório, não.

Há um objetivo pedagógico declarado — "integrar LLM com propósito real" — em
tensão com o princípio "simples que funciona". A pergunta central: **quanta
responsabilidade o LLM carrega?**

## Decisão

**Uma fronteira rígida entre LLM e código.**

- O **LLM** faz só **NL→structured** na captura: lê o texto livre da semana,
  identifica as atividades reais que Pedro descreveu, mapeia pra categoria do
  vocabulário e sugere horas. Com confirmação humana antes de salvar.
- O **motor determinístico** faz tudo o mais: divide o mês em semanas, soma
  horas reais, calcula o que falta e completa com a atividade-coringa até fechar
  a carga exata, aplica semana parcial, levanta flags. **O LLM nunca vê o número
  da carga, nunca soma, nunca inventa atividade.**

**Lógica comum no motor; o que varia entre instituições vive em config estática
por projeto** (carga, vocabulário, grade fixa, coringa, regra de semana parcial,
teto do coringa). Projeto novo = escrever config, não recodar.

## Alternativas rejeitadas

- **LLM fecha a carga (soma e infla até bater 12h).** Rejeitada: alucinação
  matemática garantida, variação de formato, e violaria a regra "nunca inventar
  atividade". Mata a razão de ser do produto.
- **Captura por dropdown determinístico (sem LLM).** Rejeitada: robusta, mas a
  descrição oficial é um lookup por categoria — não sobra trabalho real pro LLM,
  e o objetivo "LLM com propósito real" morre. O produto viraria um CRUD.
- **Regras divergentes embutidas no motor (`if projeto === X`).** Rejeitada:
  furaria a tese motor+config já no segundo projeto. A divergência de semana
  parcial validou que isso cabe em config como parâmetro.

## Consequências

- O motor e o formatador são **módulos profundos e puros**, testáveis isolados —
  alvo do TDD.
- O mapeador semântico é um wrapper de LLM **mockável**; testa-se a lógica em
  torno dele, não o LLM.
- Surge uma **tela de confirmação** obrigatória entre captura e persistência.
- O custo de adicionar o LLM no caminho da captura (latência, ponto de falha) é
  aceito em troca de propósito real e captura em linguagem natural.
- Decisões que dependem desta: fonte de horas (config / LLM+default / motor),
  exclusão de categoria (no mapeador, não no motor), persistência (só atividade
  real vira linha). Ver `docs/PRD.md`.
