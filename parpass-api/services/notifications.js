const { Expo } = require('expo-server-sdk');
const db = require('../db');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notification to a single member
 */
async function sendToMember(memberId, title, body, data = {}, notificationLogId = null) {
  const result = await db.query(`
    SELECT push_token FROM member_preferences
    WHERE member_id = $1 AND push_token IS NOT NULL AND notifications_enabled = true
  `, [memberId]);

  if (result.rows.length === 0) {
    console.log(`No push token for member ${memberId}`);
    return { success: false, reason: 'no_token', memberId };
  }

  const pushToken = result.rows[0].push_token;
  const sendResult = await sendNotification(pushToken, title, body, data);

  // Log at member level
  await logMemberNotification(
    memberId,
    notificationLogId,
    title,
    body,
    data,
    sendResult.success ? 'sent' : 'failed',
    sendResult.error || (sendResult.ticket?.details?.error)
  );

  return { ...sendResult, memberId };
}

/**
 * Send push notification to multiple members by IDs
 */
async function sendToMembers(memberIds, title, body, data = {}, notificationLogId = null) {
  const result = await db.query(`
    SELECT member_id, push_token FROM member_preferences
    WHERE member_id = ANY($1) AND push_token IS NOT NULL AND notifications_enabled = true
  `, [memberIds]);

  const memberTokenMap = result.rows.reduce((acc, r) => {
    acc[r.push_token] = r.member_id;
    return acc;
  }, {});

  const tokens = result.rows.map(r => r.push_token);
  const bulkResult = await sendBulkNotificationsWithMembers(tokens, memberTokenMap, title, body, data, notificationLogId);
  return bulkResult;
}

/**
 * Send push notification to ALL members with notifications enabled
 */
async function sendToAllMembers(title, body, data = {}, notificationLogId = null) {
  const result = await db.query(`
    SELECT member_id, push_token FROM member_preferences
    WHERE push_token IS NOT NULL AND notifications_enabled = true
  `);

  const memberTokenMap = result.rows.reduce((acc, r) => {
    acc[r.push_token] = r.member_id;
    return acc;
  }, {});

  const tokens = result.rows.map(r => r.push_token);
  console.log(`Sending broadcast notification to ${tokens.length} members`);
  return await sendBulkNotificationsWithMembers(tokens, memberTokenMap, title, body, data, notificationLogId);
}

/**
 * Send notification to members matching specific criteria
 */
async function sendByCriteria(criteria, title, body, data = {}, notificationLogId = null) {
  let query = `
    SELECT mp.push_token, m.id as member_id
    FROM member_preferences mp
    JOIN members m ON mp.member_id = m.id
    JOIN health_plans hp ON m.health_plan_id = hp.id
    JOIN plan_tiers pt ON hp.plan_tier_id = pt.id
    WHERE mp.push_token IS NOT NULL AND mp.notifications_enabled = true
  `;
  const params = [];
  let paramIndex = 1;

  // Filter by tier
  if (criteria.tier) {
    query += ` AND pt.name = $${paramIndex}`;
    params.push(criteria.tier);
    paramIndex++;
  }

  // Filter by skill level
  if (criteria.skillLevel) {
    query += ` AND mp.skill_level = $${paramIndex}`;
    params.push(criteria.skillLevel);
    paramIndex++;
  }

  // Filter by play frequency preference
  if (criteria.playFrequency) {
    query += ` AND mp.play_frequency = $${paramIndex}`;
    params.push(criteria.playFrequency);
    paramIndex++;
  }

  // Filter by members who haven't played in X days
  if (criteria.inactiveDays) {
    query += ` AND m.id NOT IN (
      SELECT DISTINCT member_id FROM golf_utilization
      WHERE checked_in_at >= NOW() - INTERVAL '${parseInt(criteria.inactiveDays)} days'
    )`;
  }

  // Filter by members who HAVE played in X days (active users)
  if (criteria.activeDays) {
    query += ` AND m.id IN (
      SELECT DISTINCT member_id FROM golf_utilization
      WHERE checked_in_at >= NOW() - INTERVAL '${parseInt(criteria.activeDays)} days'
    )`;
  }

  // Filter by members with remaining rounds
  if (criteria.hasRoundsRemaining) {
    query += ` AND (
      pt.monthly_rounds - COALESCE((
        SELECT COUNT(*) FROM golf_utilization gu
        WHERE gu.member_id = m.id
        AND gu.checked_in_at >= DATE_TRUNC('month', NOW())
      ), 0)
    ) > 0`;
  }

  // Filter by goals (any match)
  if (criteria.goals && criteria.goals.length > 0) {
    query += ` AND mp.goals && $${paramIndex}`;
    params.push(criteria.goals);
    paramIndex++;
  }

  const result = await db.query(query, params);

  const memberTokenMap = result.rows.reduce((acc, r) => {
    acc[r.push_token] = r.member_id;
    return acc;
  }, {});

  const tokens = result.rows.map(r => r.push_token);

  console.log(`Sending targeted notification to ${tokens.length} members matching criteria:`, criteria);
  return await sendBulkNotificationsWithMembers(tokens, memberTokenMap, title, body, data, notificationLogId);
}

/**
 * Send a single notification
 */
async function sendNotification(pushToken, title, body, data = {}) {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Invalid Expo push token: ${pushToken}`);
    return { success: false, reason: 'invalid_token' };
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification sent:', ticket);
    return { success: true, ticket: ticket[0] };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notifications in bulk (handles chunking for Expo's limits)
 */
async function sendBulkNotifications(pushTokens, title, body, data = {}) {
  // Filter valid tokens
  const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) {
    console.log('No valid push tokens to send to');
    return { success: true, sent: 0, failed: pushTokens.length };
  }

  // Create messages
  const messages = validTokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  // Chunk messages (Expo recommends max 100 per request)
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  let sent = 0;
  let failed = pushTokens.length - validTokens.length; // Count invalid tokens as failed

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);

      ticketChunk.forEach(ticket => {
        if (ticket.status === 'ok') sent++;
        else failed++;
      });
    } catch (error) {
      console.error('Error sending chunk:', error);
      failed += chunk.length;
    }
  }

  console.log(`Bulk notification complete: ${sent} sent, ${failed} failed`);
  return { success: true, sent, failed, tickets };
}

/**
 * Send notifications in bulk with member-level tracking
 */
async function sendBulkNotificationsWithMembers(pushTokens, memberTokenMap, title, body, data = {}, notificationLogId = null) {
  // Filter valid tokens and track invalid ones
  const validTokens = [];
  const invalidTokenMembers = [];

  for (const token of pushTokens) {
    if (Expo.isExpoPushToken(token)) {
      validTokens.push(token);
    } else {
      invalidTokenMembers.push({
        memberId: memberTokenMap[token],
        status: 'failed',
        error: 'Invalid push token'
      });
    }
  }

  // Log failed notifications for invalid tokens
  for (const invalid of invalidTokenMembers) {
    await logMemberNotification(
      invalid.memberId,
      notificationLogId,
      title,
      body,
      data,
      'failed',
      'Invalid push token'
    );
  }

  if (validTokens.length === 0) {
    console.log('No valid push tokens to send to');
    return { success: true, sent: 0, failed: pushTokens.length };
  }

  // Create messages
  const messages = validTokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  // Chunk messages (Expo recommends max 100 per request)
  const chunks = expo.chunkPushNotifications(messages);
  let sent = 0;
  let failed = invalidTokenMembers.length;
  let tokenIndex = 0;

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

      for (let i = 0; i < ticketChunk.length; i++) {
        const ticket = ticketChunk[i];
        const token = validTokens[tokenIndex + i];
        const memberId = memberTokenMap[token];

        if (ticket.status === 'ok') {
          sent++;
          await logMemberNotification(memberId, notificationLogId, title, body, data, 'sent', null);
        } else {
          failed++;
          await logMemberNotification(memberId, notificationLogId, title, body, data, 'failed', ticket.message || ticket.details?.error);
        }
      }

      tokenIndex += chunk.length;
    } catch (error) {
      console.error('Error sending chunk:', error);
      // Log failures for all members in this chunk
      for (let i = 0; i < chunk.length; i++) {
        const token = validTokens[tokenIndex + i];
        const memberId = memberTokenMap[token];
        await logMemberNotification(memberId, notificationLogId, title, body, data, 'failed', error.message);
      }
      failed += chunk.length;
      tokenIndex += chunk.length;
    }
  }

  console.log(`Bulk notification complete: ${sent} sent, ${failed} failed`);
  return { success: true, sent, failed };
}

/**
 * Log notification to database for history/analytics
 * Returns the notification_log id for linking to member notifications
 */
async function logNotification(type, title, body, criteria, recipientCount, status, sentCount = 0, failedCount = 0) {
  try {
    const result = await db.query(`
      INSERT INTO notification_log (type, title, body, criteria, recipient_count, sent_count, failed_count, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [type, title, body, JSON.stringify(criteria), recipientCount, sentCount, failedCount, status]);
    return result.rows[0].id;
  } catch (err) {
    console.error('Failed to log notification:', err);
    return null;
  }
}

/**
 * Log notification for a specific member
 */
async function logMemberNotification(memberId, notificationLogId, title, body, data, status, errorMessage = null) {
  try {
    await db.query(`
      INSERT INTO member_notifications (member_id, notification_log_id, title, body, data, status, error_message, sent_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      memberId,
      notificationLogId,
      title,
      body,
      JSON.stringify(data),
      status,
      errorMessage,
      status === 'sent' ? new Date() : null
    ]);
  } catch (err) {
    console.error('Failed to log member notification:', err);
  }
}

/**
 * Log notifications for multiple members
 */
async function logMemberNotifications(memberResults, notificationLogId, title, body, data) {
  for (const result of memberResults) {
    await logMemberNotification(
      result.memberId,
      notificationLogId,
      title,
      body,
      data,
      result.status,
      result.error
    );
  }
}

/**
 * Get notification history for a specific member
 */
async function getMemberNotifications(memberId, limit = 50) {
  const result = await db.query(`
    SELECT * FROM member_notifications
    WHERE member_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `, [memberId, limit]);
  return result.rows;
}

/**
 * Mark a notification as read
 */
async function markNotificationRead(notificationId) {
  await db.query(`
    UPDATE member_notifications
    SET status = 'read', read_at = NOW()
    WHERE id = $1
  `, [notificationId]);
}

/**
 * Get unread notification count for a member
 */
async function getUnreadCount(memberId) {
  const result = await db.query(`
    SELECT COUNT(*) as count FROM member_notifications
    WHERE member_id = $1 AND status != 'read'
  `, [memberId]);
  return parseInt(result.rows[0].count);
}

module.exports = {
  sendToMember,
  sendToMembers,
  sendToAllMembers,
  sendByCriteria,
  sendNotification,
  sendBulkNotifications,
  logNotification,
  logMemberNotification,
  logMemberNotifications,
  getMemberNotifications,
  markNotificationRead,
  getUnreadCount,
};
