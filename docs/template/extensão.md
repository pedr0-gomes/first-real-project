# Relatório Mensal de Frequência — LoOBI (Extensão)

Esta skill gera o relatório mensal de frequência da extensão LoOBI, no formato exigido pelo
SIGAA/UFCA. A carga semanal obrigatória é de **8 horas semanais**. O relatório é exibido
diretamente no chat para Pedro copiar e enviar.

---

## Dados fixos

- **Extensionista:** Pedro Gomes Sampaio (`gomes.pedro@aluno.ufca.edu.br`)
- **Projeto:** LoOBI — Laboratório de Olimpíadas de Informática
- **Frente:** Comunicação (Blog e Podcast)
- **Carga semanal:** 8 horas
- **Diário de Atividades (Notion):** `cb194d6d-299d-4ba8-a62c-740ea17708d6`

---

## Formato de saída (template do SIGAA)

O relatório lista as atividades semana a semana, no seguinte formato:

```
I SEMANA: DD/MM - [Descrição da atividade] - Xh; DD/MM - [Descrição] - Xh; ...
II SEMANA: DD/MM - [Descrição da atividade] - Xh; DD/MM - [Descrição] - Xh; ...
III SEMANA: ...
IV SEMANA: ...
[V SEMANA: ...] (se o mês tiver semanas parciais extras)
```

**Regras de preenchimento:**
- Cada entrada: `DD/MM - [descrição] - Xh`
- Separar entradas por `;` dentro da mesma semana
- A semana vai de segunda a domingo
- Toda semana deve somar exatamente 8h (inclusive semanas parciais no início/fim do mês)
- Descrições devem seguir o vocabulário oficial (ver seção abaixo)

---

## Vocabulário oficial de atividades

Use estas descrições ao redigir cada entrada:

| Categoria (Notion) | Descrição no relatório                                                        |
|--------------------|-------------------------------------------------------------------------------|
| Blog               | Produção e publicação de conteúdo para o blog do projeto LoOBI                |
| Podcast            | Gravação, edição ou planejamento de episódio de podcast do projeto LoOBI      |
| Reunião            | Participação em reunião do grupo de extensão LoOBI                            |
| Pesquisa           | Pesquisa e levantamento de referências para as atividades do projeto LoOBI    |
| Outros             | Atividade de apoio ao projeto LoOBI — [descrever brevemente]                  |

**Restrição obrigatória:** entradas com categoria **Instagram** não devem aparecer no relatório.
Se o registro no Notion for de categoria Instagram, descarte-o completamente — não converta para outra categoria, não mencione. Compense as horas que seriam dele com "Estudo e planejamento de atividades do projeto LoOBI".

O complemento padrão para fechar 8h quando não há registro suficiente:
> **"Estudo e planejamento de atividades do projeto LoOBI"**

---

## Passo 1 — Identificar o mês de referência

Pergunte a Pedro (se não estiver claro na conversa):
> "Qual mês você quer gerar o relatório da LoOBI? (ex: maio/2026)"

Com o mês definido, calcule:
- **Início:** primeiro dia do mês (D1)
- **Fim:** último dia do mês (D_last)
- **Semanas:** divida o mês em semanas de segunda a domingo. Numere como I, II, III, IV (e V se necessário). Semanas parciais no início/fim do mês também fecham 8h.

---

## Passo 2 — Buscar eventos da LoOBI no Calendar

Use `list_events` no Google Calendar:
- `calendarId`: primary
- `startTime`: primeiro dia do mês às 00:00:00 (timezone: America/Fortaleza)
- `endTime`: último dia do mês às 23:59:59 (timezone: America/Fortaleza)
- `query`: "LoOBI"

Para cada evento encontrado, registre: data, horário de início/fim, duração em horas. Esses são os eventos confirmados (reuniões, gravações, etc.).

Se nenhum evento for encontrado, informe Pedro e prossiga apenas com os registros do Notion.

---

## Passo 3 — Buscar atividades no Diário do Notion

Use `notion-search` com:
- `data_source_url`: `collection://cb194d6d-299d-4ba8-a62c-740ea17708d6`
- `query`: "LoOBI blog podcast reunião pesquisa"
- `filters.created_date_range`: `{ start_date: D1, end_date: D_last }`
- `page_size`: 50

Para cada resultado, use `notion-fetch` para obter os campos: `Atividade`, `Categoria`, `Data`, `Detalhes`. Filtre para manter apenas entradas dentro do período do mês.

**Durações padrão por categoria (quando não registrada nos Detalhes):**
- Reunião: 1h
- Blog / Podcast / Pesquisa / Instagram: 2h
- Outros: 1h

---

## Passo 4 — Distribuir as horas por semana

Para cada semana do mês:

1. Some as horas das atividades encontradas no Notion + Calendar naquela semana.
2. Se a soma for menor que 8h, complete com entradas de **"Estudo e planejamento de atividades do projeto LoOBI"** nos dias úteis restantes da semana, até atingir exatamente 8h.
3. Se a soma for maior que 8h, registre o total real — não corte atividades legítimas.
4. Semanas parciais (início ou fim de mês): fechar 8h normalmente, completando com estudo/planejamento nos dias disponíveis dentro do mês.

---

## Passo 5 — Exibir o relatório no chat

Apresente o relatório completo diretamente no chat, em bloco de código para facilitar a cópia:

```
Relatório de Frequência — LoOBI — [Mês/Ano]

I SEMANA: 04/05 - Participação em reunião do grupo de extensão LoOBI - 1h; 05/05 - Produção e publicação de conteúdo para o blog do projeto LoOBI - 2h; 06/05 - Estudo e planejamento de atividades do projeto LoOBI - 3h; 07/05 - Estudo e planejamento de atividades do projeto LoOBI - 2h.
II SEMANA: ...
```

Após exibir, pergunte se Pedro quer ajustar alguma coisa. Se sim, aplique e exiba novamente.

---

## Regras gerais

- Nunca inventar atividades — apenas o que está no Notion, no Calendar, ou o que Pedro informar explicitamente
- O complemento com "Estudo e planejamento de atividades do projeto LoOBI" é o único preenchimento permitido para completar as 8h quando não há registro
- Se uma semana ficar visivelmente inconsistente (ex: 0 atividades no Notion + 0 no Calendar), sinalize para Pedro antes de preencher automaticamente
- Sempre exibir o relatório completo no chat — não criar rascunhos no Gmail nem enviar e-mails