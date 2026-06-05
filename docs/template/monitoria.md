# Relatório Mensal de Frequência — Monitoria CC0002

Esta skill gera o relatório mensal de frequência da Monitoria de Cálculo I, no formato
exigido pelo edital do Programa de Monitoria da UFCA. A carga semanal obrigatória é de
**12 horas semanais**. O relatório é exibido diretamente no chat para Pedro copiar e enviar.

---

## Dados fixos

- **Monitor:** Pedro Gomes Sampaio (`gomes.pedro@aluno.ufca.edu.br`)
- **Orientador:** Prof. Dr. Valdir Ferreira de Paula Junior (`valdir.ferreira@ufca.edu.br`)
- **Disciplina:** Cálculo I (CC0002) — PID/UFCA
- **Carga semanal:** 12 horas
- **Diário de Atividades (Notion):** `a1193754-ebb8-4306-97df-4d1b3565e4a7`

---

## Formato de saída (template do edital)

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
- Toda semana deve somar exatamente 12h
- Descrições devem seguir o vocabulário do edital (ver seção abaixo)

---

## Vocabulário oficial de atividades (edital)

Use estas descrições — ou adaptações próximas — ao redigir cada entrada:

| Categoria (Notion)   | Descrição no relatório                                                      |
|----------------------|-----------------------------------------------------------------------------|
| Plantão              | Atendimento individualizado ou em pequenos grupos na sala de monitoria      |
| Reunião              | Participação em reunião com o orientador relativas ao programa de monitoria |
| Material de Apoio    | Estudo e aplicação de método e técnicas de ensino/aprendizagem              |
| Lista Comentada      | Elaboração de lista comentada de exercícios para os alunos                  |
| Videoaula            | Elaboração de material audiovisual de apoio às aulas                        |
| Classroom            | Organização e postagem de materiais no ambiente virtual da disciplina        |
| Outros               | Atividade de apoio à monitoria — [descrever brevemente]                     |

---

## Passo 1 — Identificar o mês de referência

Pergunte a Pedro (se não estiver claro na conversa):
> "Qual mês você quer gerar o relatório? (ex: maio/2026)"

Com o mês definido, calcule:
- **Início:** primeiro dia do mês (D1)
- **Fim:** último dia do mês (D_last)
- **Semanas:** divida o mês em semanas de segunda a domingo. A primeira semana começa na segunda anterior ou igual a D1. A última semana termina no domingo posterior ou igual a D_last. Numere como I, II, III, IV (e V se necessário).

---

## Passo 2 — Buscar horários de plantão no Calendar

Use `list_events` no Google Calendar:
- `calendarId`: primary
- `startTime`: primeiro dia do mês às 00:00:00 (timezone: America/Fortaleza)
- `endTime`: último dia do mês às 23:59:59 (timezone: America/Fortaleza)
- `query`: "monitoria" OU "plantão" OU "Cálculo"

Para cada evento encontrado, registre: data, horário de início/fim, duração em horas. Esses são os dias e cargas de **Plantão** confirmados.

Se nenhum evento for encontrado, informe Pedro e pergunte se ele quer informar os horários manualmente ou usar um padrão fixo (ex: terças e quintas das Xh às Yh).

---

## Passo 3 — Buscar atividades no Diário do Notion

Use `notion-search` com:
- `data_source_url`: `collection://a1193754-ebb8-4306-97df-4d1b3565e4a7`
- `query`: "monitoria cálculo atividade"
- `filters.created_date_range`: `{ start_date: D1, end_date: D_last }`
- `page_size`: 50

Para cada resultado, use `notion-fetch` para obter os campos: `Atividade`, `Categoria`, `Data`, `Detalhes`. Filtre para manter apenas entradas dentro do período do mês.

Monte uma lista interna organizada por data, com: data, categoria, descrição resumida, duração (quando informada nos Detalhes — se não informada, use o padrão abaixo).

**Durações padrão por categoria (quando não registrada):**
- Plantão: conforme Calendar
- Reunião: 1h
- Material de Apoio / Lista Comentada / Videoaula / Classroom: 2h
- Outros: 1h

---

## Passo 4 — Distribuir as horas por semana

Para cada semana do mês:

1. Some as horas das atividades encontradas no Notion + Calendar naquela semana.
2. Se a soma for menor que 12h, complete com entradas de **"Estudo e aplicação de método e técnicas de ensino/aprendizagem"** nos dias restantes da semana (priorizando dias úteis sem atividade registrada), até atingir exatamente 12h.
3. Se a soma for maior que 12h (improvável, mas possível), distribua as atividades nas datas reais e registre o total real — não corte atividades legítimas.
4. Semanas parciais (início ou fim de mês com menos de 5 dias úteis): calcule proporcionalmente (ex: semana com 2 dias úteis → ~4-5h) e sinalize para Pedro revisar.

---

## Passo 5 — Exibir o relatório no chat

Apresente o relatório completo diretamente no chat, em bloco de código para facilitar a cópia:

```
Relatório de Frequência — Monitoria CC0002 — [Mês/Ano]

I SEMANA: 05/05 - Atendimento individualizado ou em pequenos grupos na sala de monitoria - 2h; 06/05 - Estudo e aplicação de método e técnicas de ensino/aprendizagem - 4h; 07/05 - Atendimento individualizado ou em pequenos grupos na sala de monitoria - 2h; 08/05 - Estudo e aplicação de método e técnicas de ensino/aprendizagem - 4h.
II SEMANA: ...
```

Após exibir, pergunte se Pedro quer ajustar alguma coisa. Se sim, aplique e exiba novamente.

---

## Regras gerais

- Nunca inventar atividades — apenas o que está no Notion, no Calendar, ou o que Pedro informar explicitamente
- O complemento com "Estudo e aplicação de método e técnicas de ensino/aprendizagem" é o único preenchimento permitido para completar as 12h quando não há registro
- Se uma semana ficar visivelmente inconsistente (ex: 0 atividades no Notion + 0 no Calendar), sinalize para Pedro antes de preencher automaticamente
- Sempre exibir o relatório completo no chat — não criar rascunhos no Gmail nem enviar e-mails