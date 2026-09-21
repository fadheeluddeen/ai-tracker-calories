CREATE TABLE IF NOT EXISTS meals (
  id                serial PRIMARY KEY,
  food_name         text,
  calories          integer,
  protein_g         integer,
  carbs_g           integer,
  fat_g             integer,
  confidence        text,
  provider          text,
  photo_disk_path   text,
  photo_drive_id    text,
  analysis_failed   boolean DEFAULT false,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meals_created_at_idx ON meals (created_at);
