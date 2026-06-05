# 04 — Formatador de relatório

> Tipo: AFK · TDD · Fonte: PRD §"Módulo: Formatador de relatório"

## What to build

Módulo puro que transforma a estrutura semanal (saída do motor) na string final
no template exato da instituição, pronta pra copiar. Sem aritmética — o motor já
fez tudo; o formatador só renderiza.

Formato: `I SEMANA: DD/MM - [descrição oficial] - Xh; ...`, semanas numeradas em
romano, datas `DD/MM`, `;` entre entradas, usando a descrição oficial de cada
categoria/coringa vinda da config.

## Acceptance criteria

- [ ] Testes escritos antes (red-green-refactor)
- [ ] Estrutura conhecida → string exata esperada (golden test por instituição)
- [ ] Numeração romana das semanas correta
- [ ] Datas no formato `DD/MM`; separador `;` entre entradas
- [ ] Usa a descrição oficial da config (não o nome interno da categoria)
- [ ] Formatador é puro: mesma entrada → mesma saída

## Blocked by

- 02 — Motor de consolidação: núcleo (define o shape da estrutura de entrada)
