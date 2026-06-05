-- Tabela de atividades reais.
-- Só atividade real vira linha: grade fixa e coringa são derivados
-- (config + motor) em tempo de geração, nunca persistidos.

create table public.atividades (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users (id) on delete cascade,
  project_id      text        not null,                 -- chave da config (loobi | cc0002)
  date            date        not null,
  raw_text        text,                                 -- o que Pedro escreveu
  mapped_activity text,                                 -- atividade resolvida pelo mapeador
  category        text        not null,
  hours           numeric     not null check (hours > 0),
  created_at      timestamptz not null default now()
);

-- RLS: cada usuário só enxerga e mexe nas próprias linhas.
-- USING filtra leitura/update/delete; WITH CHECK impede inserir/mover
-- linha para outro user_id (defesa na escrita, não só na leitura).
alter table public.atividades enable row level security;

create policy "atividades_owner_all"
  on public.atividades
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
