-- Migration: Add member preferences/survey data table
-- Run this migration with: psql -d parpass -f migrations/003_add_member_preferences.sql

CREATE TABLE IF NOT EXISTS member_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    goals TEXT[], -- Array of goals: improve, exercise, social, relax, compete, explore
    play_frequency VARCHAR(20) CHECK (play_frequency IN ('weekly', 'biweekly', 'monthly', 'occasionally')),
    preferred_time VARCHAR(20) CHECK (preferred_time IN ('morning', 'afternoon', 'evening', 'flexible')),
    interests TEXT[], -- Array of interests: tournaments, lessons, deals, events, gear, news
    notifications_enabled BOOLEAN DEFAULT false,
    push_token TEXT, -- Expo push notification token
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id)
);

-- Index for quick lookups by member
CREATE INDEX IF NOT EXISTS idx_member_preferences_member_id ON member_preferences(member_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_member_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_member_preferences_updated_at ON member_preferences;
CREATE TRIGGER trigger_update_member_preferences_updated_at
    BEFORE UPDATE ON member_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_member_preferences_updated_at();

-- Add comment for documentation
COMMENT ON TABLE member_preferences IS 'Stores member survey/preference data from mobile onboarding';
