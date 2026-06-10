-- Migration v10: SMTP configuration columns
alter table site_settings
  add column if not exists smtp_host       text    default '',
  add column if not exists smtp_port       integer default 587,
  add column if not exists smtp_user       text    default '',
  add column if not exists smtp_pass       text    default '',
  add column if not exists smtp_from_name  text    default 'FECT - Friends Educational and Charitable Trust',
  add column if not exists smtp_from_email text    default '',
  add column if not exists smtp_encryption text    default 'starttls';
