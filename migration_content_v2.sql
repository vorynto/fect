-- Migration: Make all page content editable
-- Run this in your Supabase SQL Editor

-- 1. Add contact info + social links to site_settings
alter table site_settings
  add column if not exists address text default 'Chennai, Tamil Nadu, India',
  add column if not exists phone text default '+91 98765 43210',
  add column if not exists email text default 'info@fect.in',
  add column if not exists whatsapp text default '',
  add column if not exists facebook_url text default 'https://facebook.com',
  add column if not exists youtube_url text default 'https://youtube.com',
  add column if not exists instagram_url text default 'https://instagram.com/fect.friends2care',
  add column if not exists map_embed_url text default '';

update site_settings set
  address = 'Chennai, Tamil Nadu, India',
  phone = '+91 98765 43210',
  email = 'info@fect.in',
  facebook_url = 'https://facebook.com',
  youtube_url = 'https://youtube.com',
  instagram_url = 'https://instagram.com/fect.friends2care'
where address is null or address = '';

-- 2. Add all missing page_content rows
insert into page_content (page_key, section_key, title, content) values

  -- Home: Stats
  ('home', 'stat_1', '1200+', 'Students Supported'),
  ('home', 'stat_2', '15+',   'Years of Service'),
  ('home', 'stat_3', '40+',   'Active Members'),
  ('home', 'stat_4', '12+',   'Districts Covered'),

  -- Home: Process Steps (shown in ServicesSection)
  ('home', 'process_1', 'Gathering Referrals',    'Students and patients are referred by community members, schools, and hospitals.'),
  ('home', 'process_2', 'Verification',            'Our team conducts telephonic and direct field visits to verify genuine needs.'),
  ('home', 'process_3', 'Fund Raising',            'We raise funds through donations, member contributions, and corporate partnerships.'),
  ('home', 'process_4', 'Disbursal & Monitoring', 'Funds are disbursed directly and we monitor impact over time.'),

  -- Our Story: Core Values
  ('our_story', 'value_1', 'Transparency',  'Every rupee is accounted for. We publish impact reports and maintain complete financial transparency with our donors.'),
  ('our_story', 'value_2', 'Compassion',    'We treat every beneficiary with dignity and empathy, recognising that behind every case is a human story deserving respect.'),
  ('our_story', 'value_3', 'Sustainability','We aim to create lasting change — not just immediate relief — by building educational legacies across generations.'),

  -- Our Story: Sidebar registration details
  ('our_story', 'reg_number',  'TN-09/184',                ''),
  ('our_story', 'reg_date',    '06.02.2009',               ''),
  ('our_story', 'reg_type',    'Charitable Trust',         ''),
  ('our_story', 'reg_section', 'Donations tax exempt 80G', ''),

  -- Services: Hero
  ('services', 'hero', 'What We Do', 'Four focused programs — education, medical, elderly care, and community support — transforming lives across Tamil Nadu.'),

  -- Services: Process Steps
  ('services', 'process_1', 'Gathering Referrals',    'Students and patients are referred by community members, schools, hospitals, and social workers across Tamil Nadu.'),
  ('services', 'process_2', 'Verification',            'Our team conducts telephonic and direct field visits to verify the genuine needs of every referred case.'),
  ('services', 'process_3', 'Fund Raising',            'We raise funds through donations, member contributions, and corporate partnerships for verified cases.'),
  ('services', 'process_4', 'Disbursal & Monitoring', 'Funds are disbursed directly to schools, hospitals, or institutions and we monitor impact over time.'),

  -- Services: CTA
  ('services', 'cta_title',   'Want to Refer Someone?',                                              ''),
  ('services', 'cta_content', 'Know someone who needs support? Refer a student, a patient, or a care home to FECT today.', ''),

  -- Gallery: Hero
  ('gallery', 'hero', 'Our Gallery', 'Moments of impact from our work across Tamil Nadu.'),

  -- Testimonials: Hero
  ('testimonials', 'hero', 'Voices of Change', 'What our beneficiaries, volunteers, and donors say about FECT.'),

  -- Contact: Hero
  ('contact', 'hero', 'Contact Us', 'We''d love to hear from you — whether you want to volunteer, donate, or refer someone in need.'),

  -- Contact: Become member sidebar
  ('contact', 'member_title',   'Become a Member', ''),
  ('contact', 'member_content', 'Join our community of changemakers. FECT has over 40 active members — engineers, professionals, and passionate individuals committed to social impact.', ''),

  -- Donate: Hero
  ('donate', 'hero', 'Make a Donation', 'Your generosity directly transforms lives. Every rupee funds education, medical aid, and care for the vulnerable.'),

  -- Donate: Tiers (title = amount, content = description)
  ('donate', 'tier_1', '₹500/month', 'Educate a Child|Covers school fees, books, and uniform for one child throughout the academic year.'),
  ('donate', 'tier_2', '₹2,000',     'Medical Emergency|Contributes to treatment costs for a cancer patient or medical emergency case.'),
  ('donate', 'tier_3', '₹1,000/month','Elderly Care|Supports one elderly person in a care home with essentials and regular visits.'),
  ('donate', 'tier_4', '₹300',        'School Kit|Provides a complete school kit with stationery and learning materials for one child.')

on conflict (page_key, section_key) do nothing;
