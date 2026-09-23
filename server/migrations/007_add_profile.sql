CREATE TABLE IF NOT EXISTS profile (
  id              serial PRIMARY KEY,
  sex             text NOT NULL CHECK (sex IN ('male', 'female')),
  age             integer NOT NULL CHECK (age > 0),
  height_cm       numeric NOT NULL CHECK (height_cm > 0),
  activity_level  text NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal            text NOT NULL CHECK (goal IN ('lose', 'maintain', 'gain')),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id          serial PRIMARY KEY,
  weight_kg   numeric NOT NULL CHECK (weight_kg > 0),
  logged_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS weight_logs_logged_at_idx ON weight_logs (logged_at);
