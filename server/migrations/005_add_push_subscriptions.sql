CREATE TABLE IF NOT EXISTS push_subscriptions (
  id                serial PRIMARY KEY,
  endpoint          text NOT NULL UNIQUE,
  p256dh_key        text NOT NULL,
  auth_key          text NOT NULL,
  created_at        timestamptz DEFAULT now()
);
