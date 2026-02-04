-- Migration: Add member skill/handicap data for recommendation engine (Priority 2)
-- Run: psql -d parpass -f migrations/007_add_member_skill_data.sql

-- Enhanced member preferences for skill tracking
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS handicap DECIMAL(3,1);
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS handicap_source VARCHAR(20)
  CHECK (handicap_source IN ('official', 'estimated', 'self_reported'));
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS years_playing INTEGER;
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS age_range VARCHAR(20)
  CHECK (age_range IN ('18-29', '30-44', '45-59', '60+'));

-- Travel and budget preferences
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS home_zip VARCHAR(10);
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS max_travel_miles INTEGER DEFAULT 50;
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS budget_preference VARCHAR(20)
  CHECK (budget_preference IN ('budget', 'moderate', 'premium', 'any'));

-- Play style preferences
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS prefers_walking BOOLEAN DEFAULT false;
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS plays_solo BOOLEAN DEFAULT false;
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS preferred_difficulty VARCHAR(20)
  CHECK (preferred_difficulty IN ('easy', 'moderate', 'challenging', 'any'));

-- Clustering support
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS cluster_id INTEGER;
ALTER TABLE member_preferences ADD COLUMN IF NOT EXISTS cluster_updated_at TIMESTAMP WITH TIME ZONE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_member_preferences_handicap ON member_preferences(handicap);
CREATE INDEX IF NOT EXISTS idx_member_preferences_cluster ON member_preferences(cluster_id);

COMMENT ON COLUMN member_preferences.handicap IS 'Golf handicap (0-54 scale)';
COMMENT ON COLUMN member_preferences.cluster_id IS 'ML-assigned member segment cluster';
