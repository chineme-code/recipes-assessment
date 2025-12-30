CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  cuisine VARCHAR(255),
  title VARCHAR(255),
  rating DOUBLE PRECISION NULL,
  prep_time INT NULL,
  cook_time INT NULL,
  total_time INT NULL,
  description TEXT,
  nutrients JSONB,
  serves VARCHAR(50),
  calories_num INT NULL
);

CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes (rating);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes (title);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes (cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_total_time ON recipes (total_time);
CREATE INDEX IF NOT EXISTS idx_recipes_calories_num ON recipes (calories_num);
