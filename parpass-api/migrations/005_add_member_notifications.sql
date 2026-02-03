-- Migration: Add member_notifications table for per-member notification tracking
-- Run: psql -d parpass -f migrations/005_add_member_notifications.sql

CREATE TABLE IF NOT EXISTS member_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    notification_log_id UUID REFERENCES notification_log(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'sent', 'failed', 'read'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_member_notifications_member ON member_notifications(member_id);
CREATE INDEX idx_member_notifications_status ON member_notifications(status);
CREATE INDEX idx_member_notifications_created ON member_notifications(created_at DESC);
CREATE INDEX idx_member_notifications_log ON member_notifications(notification_log_id);

COMMENT ON TABLE member_notifications IS 'Tracks notifications sent to individual members';
