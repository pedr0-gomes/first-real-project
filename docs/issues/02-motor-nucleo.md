# 02 — Motor de consolidação: núcleo (happy-path)

> Tipo: AFK · TDD (red-green-refactor) · Fonte: PRD §"Módulo: Motor de consolidação"

## What to build

O coração determinístico, caminho feliz: dado atividades reais + config + mês,
produz a estrutura semanal com o coringa embutido fechando a carga exata. Módulo
puro, sem efeito colateral, interface estável — testável isolado. **O motor faz
toda a aritmética; o LLM nunca entra aqui.**

Escopo deste slice (mês "normal", semanas inteiras):

- Particionar o mês em semanas seg→dom (incluindo dias de ponta no mês vizinho
  conforme o template).
- Somar horas reais por semana.
- Calcular ΔH = `cargaSemanal` − reais e completar com a `atividadeCoringa`.
- Distribuir o coringa uniforme nos dias úteis (seg–sex) sem atividade real;
  resto do arredondamento no último dia útil (sexta); respeitar
  `tetoHorasDiaCoringa` (soft — guia o coringa, nunca bloqueia atividade real);
  ir pro fim de semana só se `aceitaFimDeSemana`.

Fica de fora deste slice: semana parcial e flags de inconsistência (slice 03).

## Acceptance criteria

- [x] Testes escritos antes da implementação (red-green-refactor)
- [x] Semana cheia só com grade fixa → estrutura correta, sem coringa indevido
- [x] Semana que precisa de coringa → ΔH preenchido até fechar a carga exata
- [x] Coringa distribuído nos dias úteis livres; resto do arredondamento na sexta
- [x] `tetoHorasDiaCoringa` guia a distribuição mas nunca corta atividade real
- [x] Coringa só vai pro fim de semana quando `aceitaFimDeSemana` é true
- [x] Soma de cada semana = `cargaSemanal` exata
- [x] Motor é puro: mesma entrada → mesma saída, sem I/O

## Blocked by

- 01 — Config dos projetos
