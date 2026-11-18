-- Profiles: one row per auth user, owner-only access.
create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade,
  display_name text,
  updated_at timestamptz not null default now(),
  primary key (id),
  constraint display_name_length check (char_length(display_name) <= 50)
);

alter table public.profiles enable row level security;

-- Data API access is explicit: signed-in users may read and update rows (RLS narrows to own row).
grant select on public.profiles to authenticated;
grant update (display_name, updated_at) on public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile when a user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

-- Only the trigger should run this; it must not be callable through the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
