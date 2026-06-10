-- Migration v9: Multi-gateway payment support
-- Run this in Supabase Dashboard → SQL Editor

alter table site_settings
  add column if not exists payment_gateway      text    default 'razorpay',
  add column if not exists billdesk_merchant_id text    default '',
  add column if not exists billdesk_env         text    default 'production',
  add column if not exists donation_qr_url      text    default '';
