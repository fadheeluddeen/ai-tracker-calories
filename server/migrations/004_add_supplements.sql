CREATE TABLE IF NOT EXISTS supplements (
  id                serial PRIMARY KEY,
  name              text NOT NULL,
  dosage            text,
  schedule_times    time[] NOT NULL DEFAULT '{}',
  active            boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now()
);
