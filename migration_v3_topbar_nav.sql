-- Migration v3: Top bar quotes, nav items, footer/header settings
-- Run in Supabase SQL Editor

-- 1. Top bar quotes table
create table if not exists top_bar_quotes (
  id uuid primary key default uuid_generate_v4(),
  quote_text text not null,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

insert into top_bar_quotes (quote_text, sort_order) values
  ('Your donation today can put a child through school tomorrow', 1),
  ('Education is the most powerful weapon you can use to change the world', 2),
  ('One act of generosity can ripple across generations', 3),
  ('Invest in a child''s education — invest in India''s future', 4),
  ('Together we can eliminate poverty one student at a time', 5)
on conflict do nothing;

alter table top_bar_quotes enable row level security;
create policy "Public read top_bar_quotes"  on top_bar_quotes for select using (is_active = true);
create policy "Admin all top_bar_quotes"    on top_bar_quotes for all    using (auth.role() = 'authenticated');

-- 2. Navigation items table
create table if not exists nav_items (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  path text not null,
  parent_id uuid references nav_items(id) on delete cascade,
  sort_order integer default 0,
  is_active boolean default true,
  is_button boolean default false,
  open_in_new boolean default false
);

-- Seed default nav (parent items first)
with parents as (
  insert into nav_items (label, path, sort_order, is_active, is_button) values
    ('Home',         '/',              1, true, false),
    ('Our Story',    '/our-story',     2, true, false),
    ('What We Do',   '/services',      3, true, false),
    ('Gallery',      '/gallery',       4, true, false),
    ('Testimonials', '/testimonials',  5, true, false),
    ('Contact',      '/contact',       6, true, false),
    ('Donate Now',   '/donate',        7, true, true )
  returning id, label
)
-- Seed child items
insert into nav_items (label, path, parent_id, sort_order, is_active)
select c.label, c.path, p.id, c.sort_order, true
from (values
  ('Our Mission',  '/our-story#mission',  'Our Story',  1),
  ('Our Services', '/services',           'What We Do', 1),
  ('Work Process', '/services#process',   'What We Do', 2)
) as c(label, path, parent_label, sort_order)
join parents p on p.label = c.parent_label
on conflict do nothing;

alter table nav_items enable row level security;
create policy "Public read nav_items"  on nav_items for select using (is_active = true);
create policy "Admin all nav_items"    on nav_items for all    using (auth.role() = 'authenticated');

-- 3. New site_settings columns
alter table site_settings
  add column if not exists top_bar_enabled   boolean default true,
  add column if not exists top_bar_reg_no    text    default 'Reg No: TN-09/184, dt 06.02.2009',
  add column if not exists footer_description text   default '',
  add column if not exists footer_copyright  text    default '',
  add column if not exists donate_button_text text   default 'Donate Now',
  add column if not exists donate_button_link text   default '/donate';

update site_settings set
  top_bar_enabled   = true,
  top_bar_reg_no    = 'Reg No: TN-09/184, dt 06.02.2009',
  donate_button_text = 'Donate Now',
  donate_button_link = '/donate'
where top_bar_reg_no is null or top_bar_reg_no = '';
