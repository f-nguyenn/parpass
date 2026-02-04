-- Migration: Seed preferences for all members to enable clustering
-- Run: psql -d parpass -f migrations/010_seed_more_member_preferences.sql

-- Insert preferences for members who don't have them
-- Using varied distributions to create interesting clusters

INSERT INTO member_preferences (
    member_id, skill_level, handicap, handicap_source, years_playing, age_range,
    play_frequency, preferred_time, budget_preference, preferred_difficulty,
    prefers_walking, plays_solo, max_travel_miles, goals
)
SELECT
    m.id,
    -- Skill level: distribute across levels
    CASE
        WHEN random() < 0.3 THEN 'beginner'
        WHEN random() < 0.7 THEN 'intermediate'
        ELSE 'advanced'
    END,
    -- Handicap: correlated with skill
    CASE
        WHEN random() < 0.3 THEN 25 + random() * 15  -- beginner: 25-40
        WHEN random() < 0.7 THEN 12 + random() * 13  -- intermediate: 12-25
        ELSE 2 + random() * 10                        -- advanced: 2-12
    END,
    'estimated',
    -- Years playing
    floor(random() * 20)::int,
    -- Age range
    (ARRAY['18-29', '30-44', '45-59', '60+'])[1 + floor(random() * 4)::int],
    -- Play frequency
    (ARRAY['weekly', 'biweekly', 'monthly', 'occasionally'])[1 + floor(random() * 4)::int],
    -- Preferred time
    (ARRAY['morning', 'afternoon', 'evening', 'flexible'])[1 + floor(random() * 4)::int],
    -- Budget preference
    (ARRAY['budget', 'moderate', 'premium', 'any'])[1 + floor(random() * 4)::int],
    -- Preferred difficulty
    (ARRAY['easy', 'moderate', 'challenging', 'any'])[1 + floor(random() * 4)::int],
    -- Prefers walking
    random() > 0.6,
    -- Plays solo
    random() > 0.7,
    -- Max travel miles
    20 + floor(random() * 60)::int,
    -- Goals: pick 2-3 random goals
    ARRAY(
        SELECT unnest FROM (
            SELECT unnest(ARRAY['improve_skills', 'meet_people', 'play_new_courses', 'relax', 'exercise', 'play_competitively', 'learn_game'])
            ORDER BY random()
            LIMIT 2 + floor(random() * 2)::int
        ) sub
    )
FROM members m
WHERE NOT EXISTS (
    SELECT 1 FROM member_preferences mp WHERE mp.member_id = m.id
);

-- Update skill level to match handicap for consistency
UPDATE member_preferences SET
    skill_level = CASE
        WHEN handicap >= 25 THEN 'beginner'
        WHEN handicap >= 12 THEN 'intermediate'
        ELSE 'advanced'
    END,
    preferred_difficulty = CASE
        WHEN handicap >= 25 THEN 'easy'
        WHEN handicap >= 12 THEN 'moderate'
        ELSE 'challenging'
    END
WHERE skill_level IS NULL OR preferred_difficulty IS NULL;

-- Create some distinct cluster profiles by adjusting specific members

-- "Ambitious Improvers" - frequent players focused on getting better
UPDATE member_preferences SET
    goals = ARRAY['improve_skills', 'play_competitively'],
    play_frequency = 'weekly',
    budget_preference = 'moderate'
WHERE member_id IN (
    SELECT member_id FROM member_preferences
    WHERE handicap BETWEEN 10 AND 20
    ORDER BY random()
    LIMIT 15
);

-- "Course Explorers" - variety seekers
UPDATE member_preferences SET
    goals = ARRAY['play_new_courses', 'relax'],
    max_travel_miles = 60 + floor(random() * 40)::int,
    budget_preference = 'any'
WHERE member_id IN (
    SELECT member_id FROM member_preferences
    WHERE member_id NOT IN (
        SELECT member_id FROM member_preferences WHERE 'improve_skills' = ANY(goals)
    )
    ORDER BY random()
    LIMIT 15
);

-- "Budget Conscious" - value seekers
UPDATE member_preferences SET
    goals = ARRAY['exercise', 'relax'],
    budget_preference = 'budget',
    preferred_difficulty = 'easy',
    max_travel_miles = 20 + floor(random() * 15)::int
WHERE member_id IN (
    SELECT member_id FROM member_preferences
    WHERE budget_preference != 'budget'
    AND member_id NOT IN (
        SELECT member_id FROM member_preferences
        WHERE 'improve_skills' = ANY(goals) OR 'play_new_courses' = ANY(goals)
    )
    ORDER BY random()
    LIMIT 15
);

-- "Premium Seekers" - quality focused
UPDATE member_preferences SET
    goals = ARRAY['relax', 'meet_people'],
    budget_preference = 'premium',
    preferred_difficulty = CASE WHEN skill_level = 'advanced' THEN 'challenging' ELSE 'moderate' END
WHERE member_id IN (
    SELECT member_id FROM member_preferences
    WHERE skill_level IN ('intermediate', 'advanced')
    AND budget_preference NOT IN ('budget', 'premium')
    ORDER BY random()
    LIMIT 15
);

-- "Casual Social Players" - play for fun with friends
UPDATE member_preferences SET
    goals = ARRAY['meet_people', 'relax'],
    play_frequency = CASE WHEN random() > 0.5 THEN 'monthly' ELSE 'occasionally' END,
    plays_solo = false
WHERE member_id IN (
    SELECT member_id FROM member_preferences
    WHERE member_id NOT IN (
        SELECT member_id FROM member_preferences
        WHERE 'improve_skills' = ANY(goals)
           OR 'play_new_courses' = ANY(goals)
           OR budget_preference = 'budget'
           OR budget_preference = 'premium'
    )
    ORDER BY random()
    LIMIT 15
);
