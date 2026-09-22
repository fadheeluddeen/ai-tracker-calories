CREATE TABLE IF NOT EXISTS pantry_ingredients (
  id                serial PRIMARY KEY,
  name              text,
  category          text,
  quantity          text,
  calories          integer,
  protein_g         integer,
  carbs_g           integer,
  fat_g             integer,
  photo_disk_path   text,
  date_added        timestamptz DEFAULT now(),
  expiry_days       integer,
  notes             text
);

CREATE INDEX IF NOT EXISTS pantry_ingredients_date_added_idx ON pantry_ingredients (date_added);
