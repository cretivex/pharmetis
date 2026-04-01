import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Create Nodemailer transporter using EMAIL_USER and EMAIL_PASS from env.
 * Uses Gmail service.
 */
function createTransporter() {
  const user = env.EMAIL_USER || process.env.EMAIL_USER;
  const pass = env.EMAIL_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    logger.error('[email] Missing EMAIL_USER or EMAIL_PASS in environment');
    throw new Error('Email configuration is missing. Set EMAIL_USER and EMAIL_PASS in .env');
  }

  const config = {
    service: 'gmail',
    auth: {
      user,
      pass
    }
  };

  const transport = nodemailer.createTransport(config);
  logger.info('[email] Transporter created with service: Gmail, user:', user ? `${user.substring(0, 3)}***` : 'not set');
  return transport;
}

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

/**
 * Send an HTML email.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 * @param {string} [text] - Optional plain text fallback
 * @returns {Promise<{ messageId: string }>}
 */
export async function sendEmail(to, subject, html, text = null) {
  const t = getTransporter();
  const fromEmail = env.EMAIL_USER || process.env.EMAIL_USER;
  const from = `"Pharmetis Platform" <${fromEmail}>`;

  const mailOptions = {
    from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, '')
  };

  try {
    const info = await t.sendMail(mailOptions);
    logger.info('[email] Sent successfully to', to, 'messageId:', info.messageId);
    return { messageId: info.messageId };
  } catch (error) {
    logger.error('[email] Send failed to', to, 'error:', error?.message || error);
    throw error;
  }
}

export { getTransporter, createTransporter };
