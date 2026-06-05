# 03 — Motor de consolidação: bordas (semana parcial + flags)

> Tipo: AFK · TDD · Fonte: PRD §"Módulo: Motor de consolidação"

## What to build

As regras de borda do motor, aditivas sobre o núcleo (slice 02): semanas parciais
nas pontas do mês e sinalização de inconsistências antes do envio. Isto é
deferível de uma primeira versão usável (dá pra tratar pontas na mão no começo) —
por isso é slice própria.

- **Semana parcial** conforme `semanaParcial`:
  - `'cheia'` → fecha a carga normal (LoOBI).
  - `'proporcional'` → `round(cargaSemanal × diasÚteisNoMês / 5)` e emite flag de
    revisão (monitoria).
- **Flags de inconsistência:**
  - semana com zero atividade real;
  - semana parcial proporcional (revisar);
  - carga real **acima** do alvo → só alerta, **sem correção automática** (não
    corta atividade real).

## Acceptance criteria

- [ ] Testes escritos antes (red-green-refactor)
- [ ] `semanaParcial: 'cheia'` fecha carga cheia na ponta do mês
- [ ] `semanaParcial: 'proporcional'` aplica a fórmula e emite a flag de revisão
- [ ] Flag de semana com zero atividade real
- [ ] Carga real acima do alvo → flag de alerta, atividade real intacta
- [ ] As flags são dados na estrutura de saída (consumíveis pela UI depois)

## Blocked by

- 02 — Motor de consolidação: núcleo
