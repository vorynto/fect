-- FECT Website Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Site Settings
create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  logo_url text default '',
  favicon_url text default '',
  primary_color text default '#c0392b',
  heading_color text default '#1a1a2e',
  font_family text default 'Inter',
  site_name text default 'FECT',
  tagline text default 'Transforming society by transforming individuals',
  updated_at timestamp with time zone default now()
);

-- Insert default settings
insert into site_settings (logo_url, favicon_url, primary_color, heading_color, font_family, site_name, tagline)
values ('', '', '#c0392b', '#1a1a2e', 'Inter', 'FECT - Friends Educational and Charitable Trust', 'Transforming society by transforming individuals')
on conflict do nothing;

-- Slider Items
create table if not exists slider_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text default '',
  button_text text default 'Learn More',
  button_link text default '/',
  image_url text default '',
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

insert into slider_items (title, description, button_text, button_link, image_url, sort_order) values
  ('Transforming Society by Transforming Individuals', 'We help underprivileged children and students with education, medical aid, and support in rural Tamil Nadu.', 'Our Story', '/our-story', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80', 1),
  ('Education is a Right, Not a Choice', 'Supporting school dropouts, college students, and the underprivileged to build a brighter future for Tamil Nadu.', 'What We Do', '/services', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80', 2),
  ('Every Donation Transforms a Life', 'Your contribution directly funds education, medical emergencies, and care for the vulnerable across Tamil Nadu.', 'Donate Now', '/donate', 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600&q=80', 3)
on conflict do nothing;

-- Gallery Albums
create table if not exists gallery_albums (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text default '',
  cover_image_url text default '',
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Gallery Images
create table if not exists gallery_images (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid references gallery_albums(id) on delete cascade,
  image_url text not null,
  caption text default '',
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Insert sample gallery albums
insert into gallery_albums (title, description, cover_image_url) values
  ('Education Support Camp 2023', 'Distribution of school kits and books to underprivileged students in rural Tamil Nadu.', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80'),
  ('Medical Aid Program', 'Financial assistance provided to cancer patients and emergency medical cases.', 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80'),
  ('Covid-19 Support 2020', 'Relief materials distributed to homeless and vulnerable communities during the pandemic.', 'https://images.unsplash.com/photo-1584036561584-b03c19da874c?w=800&q=80'),
  ('Annual Gathering 2023', 'Annual meeting of FECT members and beneficiaries celebrating impact and progress.', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80')
on conflict do nothing;

-- Testimonials
create table if not exists testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  designation text default '',
  quote text not null,
  image_url text default '',
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

insert into testimonials (name, designation, quote, sort_order) values
  ('Kavitha R.', 'FECT Beneficiary – Education Program', 'FECT changed my life. Without their support I would have dropped out of school. Today I am pursuing my engineering degree thanks to their continuous sponsorship.', 1),
  ('Rajesh M.', 'FECT Volunteer', 'Being part of FECT for over 5 years has been incredibly rewarding. We see real change in the communities we serve. The transparency and dedication of the team is inspiring.', 2),
  ('Priya S.', 'Donor since 2015', 'I have been donating to FECT for almost a decade. The impact reports and direct engagement with beneficiaries gives me confidence that every rupee is used wisely.', 3),
  ('Anbu K.', 'FECT Beneficiary – Medical Aid', 'When my father was diagnosed with cancer, FECT stepped in immediately with financial support. Their compassion and speed during our crisis was beyond words.', 4)
on conflict do nothing;

-- Page Content (CMS)
create table if not exists page_content (
  id uuid primary key default uuid_generate_v4(),
  page_key text not null,
  section_key text not null,
  title text default '',
  content text default '',
  image_url text default '',
  updated_at timestamp with time zone default now(),
  unique(page_key, section_key)
);

insert into page_content (page_key, section_key, title, content) values
  ('home', 'about', 'About FECT', 'Friends Educational and Charitable Trust (FECT) was founded by a group of computer engineering graduates who believed the best way to eliminate poverty is through education. Registered in 2009 (Reg No: TN-09/184), we have grown to over 40 active members dedicated to transforming lives across suburban and rural Tamil Nadu.'),
  ('home', 'stats_students', '1200+', 'Students Supported'),
  ('home', 'stats_years', '15+', 'Years of Service'),
  ('home', 'stats_members', '40+', 'Active Members'),
  ('home', 'stats_districts', '12+', 'Districts Covered'),
  ('home', 'donate_cta', 'Make a Difference Today', 'Your donation directly funds education for underprivileged children, medical aid for cancer patients, and care for the elderly and mentally challenged. Every rupee counts.'),
  ('our_story', 'hero', 'Our Story', 'From three friends with a vision to an organisation that has touched thousands of lives across Tamil Nadu.'),
  ('our_story', 'founding', 'How It All Began', 'FECT began in the summer of 2006 as casual discussions among three computer engineering friends who called themselves "Friends to Care." After two years of building their careers, they reunited with a shared mission: to use education as the most powerful tool to eliminate poverty. The trust was formally registered on February 6, 2009.'),
  ('our_story', 'mission', 'Our Mission', 'To empower underprivileged children and youth through quality education, and to provide compassionate support for medical emergencies, elderly care, and the mentally challenged — building a self-sustaining cycle where today''s beneficiaries become tomorrow''s contributors.'),
  ('our_story', 'vision', 'Our Vision', 'A Tamil Nadu where no child is denied education due to poverty, where no family faces a medical crisis alone, and where every individual regardless of background has the opportunity to thrive.'),
  ('services', 'education', 'Education Support', 'We identify school dropouts and underprivileged students, verify their needs, and provide full sponsorship including school fees, books, uniforms, and tuition support from primary school through graduation.'),
  ('services', 'medical', 'Medical Assistance', 'We provide emergency financial assistance to families facing medical crises — especially cancer patients — covering hospital bills, medicines, and treatment costs in partnership with hospitals across Tamil Nadu.'),
  ('services', 'home', 'Orphanage & Elderly Care', 'We sponsor orphanages, elderly care homes, and institutions for the mentally challenged — providing funds, essentials, and regular visits to ensure dignity and comfort for the most vulnerable.'),
  ('contact', 'info', 'Contact Us', 'We would love to hear from you. Whether you want to volunteer, refer someone in need, or simply learn more about our work, please get in touch.'),
  ('donate', 'intro', 'Support Our Cause', 'Your donation directly transforms lives. FECT is a registered charitable trust — donations are eligible for tax exemption under Section 80G.')
on conflict (page_key, section_key) do nothing;

-- Programs / Services
create table if not exists programs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  icon text default 'BookOpen',
  sort_order integer default 0,
  is_active boolean default true
);

insert into programs (title, description, icon, sort_order) values
  ('Education', 'Full sponsorship for underprivileged students from school through graduation — fees, books, uniforms, and tuition.', 'GraduationCap', 1),
  ('Medical Aid', 'Emergency financial assistance for cancer patients and medical crises, covering hospital and treatment costs.', 'Heart', 2),
  ('Orphanage & Elderly', 'Sponsorship and regular support for orphanages, elderly homes, and care institutions for the challenged.', 'Home', 3),
  ('Community Support', 'Distribution of essentials, school kits, and relief materials to homeless and vulnerable communities.', 'Users', 4)
on conflict do nothing;

-- Team Members
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text default '',
  bio text default '',
  image_url text default '',
  sort_order integer default 0,
  is_active boolean default true
);

-- Donations
create table if not exists donations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text default '',
  amount integer not null,
  razorpay_order_id text default '',
  razorpay_payment_id text default '',
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- Contact Messages
create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text default '',
  subject text default '',
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS)
alter table site_settings enable row level security;
alter table slider_items enable row level security;
alter table gallery_albums enable row level security;
alter table gallery_images enable row level security;
alter table testimonials enable row level security;
alter table page_content enable row level security;
alter table programs enable row level security;
alter table team_members enable row level security;
alter table donations enable row level security;
alter table contact_messages enable row level security;

-- Public read policies
create policy "Public read site_settings" on site_settings for select using (true);
create policy "Public read slider_items" on slider_items for select using (is_active = true);
create policy "Public read gallery_albums" on gallery_albums for select using (is_active = true);
create policy "Public read gallery_images" on gallery_images for select using (true);
create policy "Public read testimonials" on testimonials for select using (is_active = true);
create policy "Public read page_content" on page_content for select using (true);
create policy "Public read programs" on programs for select using (is_active = true);
create policy "Public read team_members" on team_members for select using (is_active = true);

-- Public insert for donations and contact
create policy "Public insert donations" on donations for insert with check (true);
create policy "Public insert contact_messages" on contact_messages for insert with check (true);

-- Admin full access (authenticated users)
create policy "Admin full access site_settings" on site_settings for all using (auth.role() = 'authenticated');
create policy "Admin full access slider_items" on slider_items for all using (auth.role() = 'authenticated');
create policy "Admin full access gallery_albums" on gallery_albums for all using (auth.role() = 'authenticated');
create policy "Admin full access gallery_images" on gallery_images for all using (auth.role() = 'authenticated');
create policy "Admin full access testimonials" on testimonials for all using (auth.role() = 'authenticated');
create policy "Admin full access page_content" on page_content for all using (auth.role() = 'authenticated');
create policy "Admin full access programs" on programs for all using (auth.role() = 'authenticated');
create policy "Admin full access team_members" on team_members for all using (auth.role() = 'authenticated');
create policy "Admin read donations" on donations for select using (auth.role() = 'authenticated');
create policy "Admin read contacts" on contact_messages for all using (auth.role() = 'authenticated');

-- Storage bucket for uploads (run in Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('fect-uploads', 'fect-uploads', true);
