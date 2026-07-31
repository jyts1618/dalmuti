create table if not exists public.dalmuti_reviews (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 1 and 16),
  content text not null check (char_length(content) between 1 and 500),
  rating integer not null check (rating between 1 and 5),
  delete_password text not null check (char_length(delete_password) between 1 and 24),
  created_at timestamptz not null default now()
);

alter table public.dalmuti_reviews enable row level security;

drop policy if exists "Anyone can read dalmuti reviews" on public.dalmuti_reviews;
create policy "Anyone can read dalmuti reviews"
on public.dalmuti_reviews
for select
using (true);

drop policy if exists "Anyone can create dalmuti reviews" on public.dalmuti_reviews;
create policy "Anyone can create dalmuti reviews"
on public.dalmuti_reviews
for insert
with check (
  char_length(nickname) between 1 and 16
  and char_length(content) between 1 and 500
  and rating between 1 and 5
  and char_length(delete_password) between 1 and 24
);

create or replace function public.delete_dalmuti_review(review_id uuid, review_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.dalmuti_reviews
  where id = review_id
    and delete_password = review_password;

  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

grant execute on function public.delete_dalmuti_review(uuid, text) to anon;
