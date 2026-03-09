/**
 * System alerting: log, Slack webhook, and email.
 * Rate-limited per alert type to prevent flooding.
 */
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import nodemailer from 'nodemailer';

const ALERT_TYPES = ['health_failure', 'high_latency', 'auth_spike', 'db_issue'];
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes per alert type

const lastSentByType = new Map();

function isRateLimited(type) {
  const last = lastSentByType.get(type);
  if (!last) return false;
  return Date.now() - last < RATE_LIMIT_MS;
}

function markSent(type) {
  lastSentByType.set(type, Date.now());
}

async function sendSlackAlert(type, message) {
  const webhook = env.ALERT_SLACK_WEBHOOK?.trim();
  if (!webhook) return;

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${type}] ${message}`,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `*Alert:* \`${type}\`\n${message}` }
          }
        ]
      })
    });
    if (!res.ok) {
      logger.warn('[ALERT] Slack webhook failed', { status: res.status, type });
    }
  } catch (err) {
    logger.warn('[ALERT] Slack send error', { type, error: err?.message });
  }
}

async function sendEmailAlert(type, message) {
  const from = env.ALERT_EMAIL_FROM?.trim();
  const to = env.ALERT_EMAIL_TO?.trim();
  if (!from || !to) return;

  const user = env.SMTP_USER || env.EMAIL_USER;
  const pass = env.SMTP_PASS || env.EMAIL_PASS;
  if (!user || !pass) return;

  try {
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: env.SMTP_PORT || 587,
      secure: (env.SMTP_PORT || 587) === 465,
      auth: { user, pass }
    });

    await transport.sendMail({
      from,
      to: to.split(',').map(s => s.trim()).filter(Boolean),
      subject: `[Pharmetis Admin] ${type}`,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`
    });
  } catch (err) {
    logger.warn('[ALERT] Email send error', { type, error: err?.message });
  }
}

/**
 * Send a system alert. Logs always; Slack and email when configured.
 * Rate-limited per alert type (max one per 5 minutes per type).
 * @param {string} type - One of: health_failure, high_latency, auth_spike, db_issue
 * @param {string} message - Human-readable message
 */
export async function sendSystemAlert(type, message) {
  const normalized = ALERT_TYPES.includes(type) ? type : 'unknown';

  logger.warn(`[ALERT][${normalized}] ${message}`);

  if (isRateLimited(normalized)) {
    return;
  }

  markSent(normalized);

  await Promise.all([
    sendSlackAlert(normalized, message),
    sendEmailAlert(normalized, message)
  ]);
}
