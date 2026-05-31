-- Migration v4: Rename nav labels and remove dropdown sub-items
-- Run in Supabase SQL Editor

-- 1. Rename top-level nav items
update nav_items set label = 'About Us'      where label = 'Our Story'  and parent_id is null;
update nav_items set label = 'Our Services'  where label = 'What We Do' and parent_id is null;

-- 2. Delete all child nav items (sub-page dropdowns) for these two entries
delete from nav_items
where parent_id in (
  select id from nav_items
  where label in ('About Us', 'Our Services')
);

-- 3. Update page_content hero titles to match new names
update page_content set title = 'About Us'     where page_key = 'our_story' and section_key = 'hero';
update page_content set title = 'Our Services' where page_key = 'services'  and section_key = 'hero';

-- 4. Update slider items button text (if using DB slider, not fallback)
update slider_items set button_text = 'About Us'      where button_text = 'Our Story';
update slider_items set button_text = 'Our Services'  where button_text = 'What We Do';
