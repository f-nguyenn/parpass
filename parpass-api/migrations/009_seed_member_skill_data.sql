-- Migration: Seed member skill/preference data for ML models
-- Run: psql -d parpass -f migrations/009_seed_member_skill_data.sql

-- Update existing members with varied skill data

-- Marcus Thompson - Intermediate player, improving
UPDATE member_preferences SET
  handicap = 15.2,
  handicap_source = 'self_reported',
  years_playing = 8,
  age_range = '30-44',
  home_zip = '32256',
  max_travel_miles = 40,
  budget_preference = 'moderate',
  prefers_walking = false,
  plays_solo = false,
  preferred_difficulty = 'moderate'
WHERE member_id = 'aaaaaaaa-0001-0001-0001-000000000001';

-- Insert preferences for members who don't have records yet
INSERT INTO member_preferences (member_id, skill_level, handicap, handicap_source, years_playing, age_range, home_zip, max_travel_miles, budget_preference, prefers_walking, plays_solo, preferred_difficulty, goals, play_frequency, preferred_time)
VALUES
  -- Rachel Gonzalez - Beginner
  ('aaaaaaaa-0002-0002-0002-000000000002', 'beginner', 28.5, 'estimated', 2, '18-29', '32224', 30, 'budget', true, false, 'easy', ARRAY['improve_skills', 'meet_people'], 'weekly', 'morning'),

  -- Derek Washington - Advanced
  ('aaaaaaaa-0003-0003-0003-000000000003', 'advanced', 6.8, 'official', 20, '45-59', '32217', 60, 'premium', false, true, 'challenging', ARRAY['play_competitively', 'play_new_courses'], 'weekly', 'morning'),

  -- Amanda Chen - Intermediate
  ('aaaaaaaa-0004-0004-0004-000000000004', 'intermediate', 18.3, 'self_reported', 5, '30-44', '32258', 35, 'moderate', true, false, 'moderate', ARRAY['improve_skills', 'exercise'], 'biweekly', 'afternoon'),

  -- Carlos Rivera - Beginner
  ('aaaaaaaa-0005-0005-0005-000000000005', 'beginner', 32.0, 'estimated', 1, '18-29', '32246', 25, 'budget', true, false, 'easy', ARRAY['learn_game', 'meet_people'], 'monthly', 'flexible'),

  -- Brittany Moore - Intermediate
  ('aaaaaaaa-0006-0006-0006-000000000006', 'intermediate', 16.5, 'self_reported', 6, '30-44', '32225', 40, 'moderate', false, false, 'moderate', ARRAY['improve_skills', 'relax'], 'biweekly', 'morning'),

  -- Kevin Patel - Advanced
  ('aaaaaaaa-0007-0007-0007-000000000007', 'advanced', 8.2, 'official', 15, '30-44', '32211', 50, 'premium', true, true, 'challenging', ARRAY['play_competitively', 'improve_skills'], 'weekly', 'morning'),

  -- Stephanie Williams - Beginner
  ('aaaaaaaa-0008-0008-0008-000000000008', 'beginner', 35.0, 'estimated', 0, '45-59', '32244', 20, 'budget', false, false, 'easy', ARRAY['learn_game', 'exercise'], 'occasionally', 'afternoon'),

  -- Michael Johnson - Intermediate
  ('aaaaaaaa-0009-0009-0009-000000000009', 'intermediate', 14.0, 'self_reported', 10, '45-59', '32218', 45, 'moderate', false, true, 'moderate', ARRAY['relax', 'play_new_courses'], 'weekly', 'morning'),

  -- Jessica Davis - Advanced
  ('aaaaaaaa-0010-0010-0010-000000000010', 'advanced', 5.5, 'official', 18, '30-44', '32256', 70, 'any', true, false, 'challenging', ARRAY['play_competitively', 'play_new_courses'], 'weekly', 'flexible')

ON CONFLICT (member_id) DO UPDATE SET
  skill_level = EXCLUDED.skill_level,
  handicap = EXCLUDED.handicap,
  handicap_source = EXCLUDED.handicap_source,
  years_playing = EXCLUDED.years_playing,
  age_range = EXCLUDED.age_range,
  home_zip = EXCLUDED.home_zip,
  max_travel_miles = EXCLUDED.max_travel_miles,
  budget_preference = EXCLUDED.budget_preference,
  prefers_walking = EXCLUDED.prefers_walking,
  plays_solo = EXCLUDED.plays_solo,
  preferred_difficulty = EXCLUDED.preferred_difficulty,
  goals = COALESCE(EXCLUDED.goals, member_preferences.goals),
  play_frequency = COALESCE(EXCLUDED.play_frequency, member_preferences.play_frequency),
  preferred_time = COALESCE(EXCLUDED.preferred_time, member_preferences.preferred_time);

-- Add more varied members to make clustering interesting
-- Get remaining member IDs and update them with random distributions
UPDATE member_preferences mp SET
  handicap = CASE
    WHEN m.id::text LIKE '%11%' THEN 22.5
    WHEN m.id::text LIKE '%12%' THEN 12.0
    WHEN m.id::text LIKE '%13%' THEN 30.0
    WHEN m.id::text LIKE '%14%' THEN 9.5
    WHEN m.id::text LIKE '%15%' THEN 25.0
    WHEN m.id::text LIKE '%16%' THEN 17.0
    WHEN m.id::text LIKE '%17%' THEN 7.0
    WHEN m.id::text LIKE '%18%' THEN 21.0
    WHEN m.id::text LIKE '%19%' THEN 11.5
    ELSE 18.0
  END,
  handicap_source = 'estimated',
  years_playing = CASE
    WHEN mp.skill_level = 'beginner' THEN floor(random() * 3)::int
    WHEN mp.skill_level = 'intermediate' THEN 3 + floor(random() * 10)::int
    ELSE 10 + floor(random() * 15)::int
  END,
  age_range = (ARRAY['18-29', '30-44', '45-59', '60+'])[1 + floor(random() * 4)::int],
  max_travel_miles = 20 + floor(random() * 50)::int,
  budget_preference = (ARRAY['budget', 'moderate', 'premium', 'any'])[1 + floor(random() * 4)::int],
  prefers_walking = random() > 0.6,
  plays_solo = random() > 0.7,
  preferred_difficulty = CASE
    WHEN mp.skill_level = 'beginner' THEN 'easy'
    WHEN mp.skill_level = 'intermediate' THEN 'moderate'
    WHEN mp.skill_level = 'advanced' THEN 'challenging'
    ELSE 'any'
  END
FROM members m
WHERE mp.member_id = m.id
  AND mp.handicap IS NULL;
