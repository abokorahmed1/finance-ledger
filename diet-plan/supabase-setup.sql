-- Level 1 diary storage. Paste into Supabase → SQL Editor → Run.

create table if not exists diaries (
  slug        text primary key,            -- one per client, e.g. "kazi"
  name        text not null default '',
  week        int  not null default 1,
  data        jsonb not null default '{}'::jsonb,
  pin         text,
  updated_at  timestamptz not null default now()
);

-- if the table already exists from an earlier run:
alter table diaries add column if not exists pin text;

alter table diaries enable row level security;

-- Anyone holding the public key may read and write a diary row.
-- The link is the secret: a client only knows his own slug.
drop policy if exists diaries_read  on diaries;
drop policy if exists diaries_write on diaries;
drop policy if exists diaries_edit  on diaries;

create policy diaries_read  on diaries for select using (true);
create policy diaries_write on diaries for insert with check (true);
create policy diaries_edit  on diaries for update using (true) with check (true);

-- Live updates for the coach dashboard.
alter publication supabase_realtime add table diaries;
