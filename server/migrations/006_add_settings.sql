CREATE TABLE IF NOT EXISTS settings (
  key         text PRIMARY KEY,
  value       text,
  updated_at  timestamptz DEFAULT now()
);
