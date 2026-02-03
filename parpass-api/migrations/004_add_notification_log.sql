-- Migration: Add notification_log table for tracking sent notifications
-- Run: psql -d parpass -f migrations/004_add_notification_log.sql

CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,  -- 'broadcast', 'targeted', 'individual'
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    criteria JSONB,  -- Store targeting criteria (tier, skillLevel, etc.)
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'sent',  -- 'sent', 'partial', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_log_type ON notification_log(type);
CREATE INDEX idx_notification_log_created ON notification_log(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE notification_log IS 'Stores history of push notifications sent to members';
