import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  const user = env.SMTP_USER || env.EMAIL_USER;
  const pass = env.SMTP_PASS || env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email configuration is missing. Set EMAIL_USER and EMAIL_PASS (or SMTP_USER and SMTP_PASS) in your .env file.');
  }

  const host = env.SMTP_HOST || 'smtp.gmail.com';
  const port = env.SMTP_PORT || 587;

  const config = {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  };

  logger.info(`Creating SMTP transporter: ${host}:${port}, User: ${user ? user.substring(0, 3) + '***' : 'not set'}`);
  transporter = nodemailer.createTransport(config);

  return transporter;
};

export const sendOTPEmail = async (email, otpCode) => {
  try {
    const mailTransporter = createTransporter();

    try {
      await mailTransporter.verify();
      logger.info('SMTP connection verified before sending');
    } catch (verifyError) {
      logger.error('SMTP verification failed:', verifyError);
      throw new Error(`SMTP connection failed: ${verifyError.message}`);
    }

    const fromEmail = env.SMTP_FROM || env.EMAIL_USER;
    const expiryMinutes = env.OTP_EXPIRY_MINUTES || 5;

    const mailOptions = {
      from: `"Pharmetis Platform" <${fromEmail}>`,
      to: email,
      subject: 'Your Login OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Login OTP</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Your OTP is:</p>
          <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 20px 0; text-align: center; font-weight: bold;">${otpCode}</h1>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">This code expires in ${expiryMinutes} minutes.</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      text: `
        Your Login OTP

        Your OTP is: ${otpCode}

        This code expires in ${expiryMinutes} minutes.

        If you didn't request this code, please ignore this email.
      `
    };

    const host = env.SMTP_HOST || 'smtp.gmail.com';
    const port = env.SMTP_PORT || 587;
    logger.info(`Attempting to send OTP email to ${email} via ${host}:${port}`);
    const info = await mailTransporter.sendMail(mailOptions);
    logger.info(`✅ OTP email sent successfully to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`❌ Failed to send OTP email to ${email}:`, {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    
    // Provide more helpful error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env. For Gmail, use an App Password (not your regular password).');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Could not connect to SMTP server. Please check SMTP_HOST and SMTP_PORT.');
    } else if (error.responseCode === 535) {
      throw new Error('Authentication failed. For Gmail, use an App Password (not your regular password).');
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const verifySMTPConnection = async () => {
  try {
    const mailTransporter = createTransporter();
    await mailTransporter.verify();
    logger.info('SMTP connection verified');
    return true;
  } catch (error) {
    logger.error('SMTP connection failed:', error);
    return false;
  }
};
