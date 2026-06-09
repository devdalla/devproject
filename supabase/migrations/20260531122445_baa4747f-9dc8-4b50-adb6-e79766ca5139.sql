
-- Roles
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "profile self select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profile self insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profile self update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category text not null,
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  sizes text[] not null default array['S','M','L','XL'],
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create policy "products public read" on public.products for select to anon, authenticated using (true);
create policy "admins manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  total_cents integer not null,
  shipping_address jsonb,
  notes text,
  created_at timestamptz not null default now()
);

grant select, insert on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create policy "orders self select" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "orders self insert" on public.orders for insert to authenticated with check (auth.uid() = user_id);
create policy "admins read all orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Order items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  size text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null
);

grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;

create policy "items self select" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "items self insert" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "admins read all items" on public.order_items for select to authenticated using (public.has_role(auth.uid(), 'admin'));
