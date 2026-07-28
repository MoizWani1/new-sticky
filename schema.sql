-- Create products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  order_items jsonb not null,
  total_amount numeric not null,
  status text default 'Pending' check (status in ('Pending', 'Delivered', 'Cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table products enable row level security;
alter table orders enable row level security;

-- Policies for products
create policy "Public products are viewable by everyone"
  on products for select
  to public
  using (true);

create policy "Admins can insert products"
  on products for insert
  to authenticated
  with check (true);

create policy "Admins can update products"
  on products for update
  to authenticated
  using (true);

create policy "Admins can delete products"
  on products for delete
  to authenticated
  using (true);

-- Policies for orders
create policy "Customers can create orders"
  on orders for insert
  to public
  with check (true);

create policy "Admins can view all orders"
  on orders for select
  to authenticated
  using (true);

create policy "Admins can update orders"
  on orders for update
  to authenticated
  using (true);

-- Add rejected_at column if it doesn't exist
alter table orders add column if not exists rejected_at timestamp with time zone;

-- Add discount_type to vouchers
alter table vouchers add column if not exists discount_type text default 'fixed' check (discount_type in ('fixed', 'percentage'));
