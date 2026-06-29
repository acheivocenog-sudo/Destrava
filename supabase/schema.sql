-- Tabela de itens (tarefas, rotinas, projetos, estacionamento)
create table if not exists public.items (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null check (category in ('rotina', 'tarefa', 'projeto', 'estacionamento')),
  priority integer default 5 check (priority >= 0 and priority <= 10),
  status text default 'ativo' check (status in ('ativo', 'concluido', 'cancelado')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  frequency text check (frequency in ('diaria', 'semanal', 'mensal')),
  suggested_time text,
  completed_today boolean default false,
  deadline text,
  next_action text,
  objective text,
  steps jsonb default '[]'::jsonb,
  progress integer default 0,
  reason text,
  review_date text
);

-- Tabela de renúncias
create table if not exists public.renuncias (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Row Level Security: cada usuário acessa apenas seus próprios dados
alter table public.items enable row level security;
alter table public.renuncias enable row level security;

create policy "items: usuário acessa os próprios" on public.items
  for all using (auth.uid() = user_id);

create policy "renuncias: usuário acessa as próprias" on public.renuncias
  for all using (auth.uid() = user_id);
