-- Migration: Add course attributes for recommendation engine (Priority 1)
-- Run: psql -d parpass -f migrations/006_add_course_attributes.sql

-- Course difficulty and type
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20)
  CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'expert'));

ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS course_type VARCHAR(30)
  CHECK (course_type IN ('public', 'semi-private', 'resort', 'links', 'parkland', 'desert', 'executive'));

ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS price_range VARCHAR(20)
  CHECK (price_range IN ('budget', 'moderate', 'premium', 'luxury'));

-- Course ratings (USGA)
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS course_rating DECIMAL(4,1);
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS slope_rating INTEGER;
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS par INTEGER DEFAULT 72;
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS yardage INTEGER;

-- Pace and playability
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS pace_of_play_mins INTEGER;
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS walking_friendly BOOLEAN DEFAULT true;

-- Amenities
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS has_driving_range BOOLEAN DEFAULT false;
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS has_practice_green BOOLEAN DEFAULT false;
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS has_restaurant BOOLEAN DEFAULT false;
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS has_pro_shop BOOLEAN DEFAULT false;
ALTER TABLE golf_courses ADD COLUMN IF NOT EXISTS cart_included BOOLEAN DEFAULT false;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_golf_courses_difficulty ON golf_courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_golf_courses_type ON golf_courses(course_type);
CREATE INDEX IF NOT EXISTS idx_golf_courses_price ON golf_courses(price_range);

COMMENT ON COLUMN golf_courses.difficulty IS 'Course difficulty level for skill matching';
COMMENT ON COLUMN golf_courses.course_rating IS 'USGA course rating';
COMMENT ON COLUMN golf_courses.slope_rating IS 'USGA slope rating (55-155)';
COMMENT ON COLUMN golf_courses.pace_of_play_mins IS 'Average round duration in minutes';
