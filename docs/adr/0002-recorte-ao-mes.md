# ADR-0002 — Recorte ao mês: entradas ⊆ mês de referência

- **Status:** aceito
- **Data:** 2026-06-05
- **Decisores:** Pedro (curadoria); decisão emergiu na implementação do slice 03.

## Contexto

O relatório é **mensal**, mas a semana vai de **segunda a domingo** — então as
semanas das pontas (I e última) extravasam para o mês vizinho. A I SEMANA de
julho/2026, por exemplo, começa numa segunda de junho (29/06).

O slice 02 (núcleo) nunca encarou isso: foi testado só no interior do mês. O
slice 03, ao introduzir a **semana parcial proporcional** (alvo ∝ dias úteis no
mês), forçou a pergunta: os dias da semana que caem no mês vizinho recebem grade,
atividade real e coringa? Se sim, o proporcional fica incoerente — reduz o alvo
por haver menos dias no mês e depois espalha horas justamente fora dele.

A fonte canônica respondeu: no template da monitoria (`docs/template/monitoria.md`,
Passo 5), **todas as datas do relatório são do mês de referência**.

## Decisão

**O motor só monta entradas em dias dentro do mês.** Grade fixa, atividade real e
coringa são recortados a `[primeiro dia, último dia]` do mês de referência. Os
dias da semana que caem no mês vizinho não recebem nada — pertencem ao relatório
*daquele* mês.

O alvo da semana parcial proporcional conta apenas `diasÚteisNoMês`:
`round(cargaSemanal × diasÚteisNoMês / 5)`.

## Alternativas rejeitadas

- **Semana inteira conta (incluindo dias do mês vizinho).** Rejeitada:
  duplicaria horas entre relatórios de meses adjacentes (29/06 apareceria tanto
  em junho quanto em julho) e contradiz o template, onde toda data é do mês.
- **Atribuir cada dia-fronteira ao mês com mais dias daquela semana.** Rejeitada:
  regra arbitrária, ausente do template, e ainda assim quebraria a soma exata.

## Consequências

- Invariante **`entradas ⊆ mês`**: o formatador (slice 04) e configs futuras
  podem assumir que nenhuma linha do relatório cai fora do mês.
- `inicio`/`fim` de uma `SemanaConsolidada` ainda podem cair no mês vizinho — são
  o **rótulo** seg→dom da semana, não uma promessa sobre as entradas.
- Uma atividade real capturada num dia do mês vizinho é **silenciosamente
  excluída** deste relatório (entra no do mês a que pertence). A borda de captura
  já filtra por mês; o motor só reforça o invariante.
- A `carga-incompleta` pode aparecer mais cedo em semanas parciais cheias com
  poucos dias no mês — é sinalização honesta, não regressão.
