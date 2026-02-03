const { Expo } = require('expo-server-sdk');
const db = require('../db');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notification to a single member
 */
async function sendToMember(memberId, title, body, data = {}) {
  const result = await db.query(`
    SELECT push_token FROM member_preferences
    WHERE member_id = $1 AND push_token IS NOT NULL AND notifications_enabled = true
  `, [memberId]);

  if (result.rows.length === 0) {
    console.log(`No push token for member ${memberId}`);
    return { success: false, reason: 'no_token' };
  }

  const pushToken = result.rows[0].push_token;
  return await sendNotification(pushToken, title, body, data);
}

/**
 * Send push notification to multiple members by IDs
 */
async function sendToMembers(memberIds, title, body, data = {}) {
  const result = await db.query(`
    SELECT member_id, push_token FROM member_preferences
    WHERE member_id = ANY($1) AND push_token IS NOT NULL AND notifications_enabled = true
  `, [memberIds]);

  const tokens = result.rows.map(r => r.push_token);
  return await sendBulkNotifications(tokens, title, body, data);
}

/**
 * Send push notification to ALL members with notifications enabled
 */
async function sendToAllMembers(title, body, data = {}) {
  const result = await db.query(`
    SELECT push_token FROM member_preferences
    WHERE push_token IS NOT NULL AND notifications_enabled = true
  `);

  const tokens = result.rows.map(r => r.push_token);
  console.log(`Sending broadcast notification to ${tokens.length} members`);
  return await sendBulkNotifications(tokens, title, body, data);
}

/**
 * Send notification to members matching specific criteria
 */
async function sendByCriteria(criteria, title, body, data = {}) {
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
  const tokens = result.rows.map(r => r.push_token);

  console.log(`Sending targeted notification to ${tokens.length} members matching criteria:`, criteria);
  return await sendBulkNotifications(tokens, title, body, data);
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
    return { success: true, sent: 0, failed: 0 };
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
  let failed = 0;

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
 * Log notification to database for history/analytics
 */
async function logNotification(type, title, body, criteria, recipientCount, status, sentCount = 0, failedCount = 0) {
  try {
    await db.query(`
      INSERT INTO notification_log (type, title, body, criteria, recipient_count, sent_count, failed_count, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [type, title, body, JSON.stringify(criteria), recipientCount, sentCount, failedCount, status]);
  } catch (err) {
    console.error('Failed to log notification:', err);
  }
}

module.exports = {
  sendToMember,
  sendToMembers,
  sendToAllMembers,
  sendByCriteria,
  sendNotification,
  sendBulkNotifications,
  logNotification,
};
