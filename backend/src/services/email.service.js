import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  const user = env.SMTP_USER || env.EMAIL_USER;
  const pass = env.SMTP_PASS || env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email configuration is missing. Set EMAIL_USER/EMAIL_PASS or SMTP_USER/SMTP_PASS in .env');
  }

  let config;
  if (env.SMTP_HOST) {
    config = {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: (env.SMTP_PORT || 587) === 465,
      auth: { user, pass }
    };
    logger.info(`Email: using SMTP ${env.SMTP_HOST}:${config.port}`);
  } else {
    config = {
      service: env.EMAIL_PROVIDER || 'gmail',
      auth: { user, pass }
    };
  }

  transporter = nodemailer.createTransport(config);
  return transporter;
};

/**
 * Send OTP email. purpose: 'registration' | 'login' | 'password_reset'
 * Uses same transporter as all other OTPs for consistent delivery.
 */
export const sendOTPEmail = async (email, otpCode, isRegistration = false, purpose = null) => {
  const isPasswordReset = purpose === 'password_reset';
  const expiryMinutes = isPasswordReset ? 10 : (env.OTP_EXPIRY_MINUTES || 5);
  const subject = isPasswordReset
    ? 'Your Password Reset OTP - Supplier Portal'
    : isRegistration ? 'Your Registration OTP Code' : 'Your Login OTP Code';
  const title = isPasswordReset ? 'Password Reset OTP' : (isRegistration ? 'Your Registration OTP' : 'Your Login OTP');
  const description = isPasswordReset
    ? 'You requested to reset your password. Use the 6-digit code below:'
    : isRegistration ? 'You requested a registration OTP code. Use the code below to complete your registration:' : 'You requested a login OTP code. Use the code below to complete your login:';

  try {
    const mailTransporter = createTransporter();
    const fromEmail = env.SMTP_FROM || env.EMAIL_USER;

    const mailOptions = {
      from: `"Pharmetis Platform" <${fromEmail}>`,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Pharmetis ${isPasswordReset ? 'Supplier Portal' : 'Platform'}</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">${title}</h2>
            <p>Hello,</p>
            <p>${description}</p>
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${otpCode}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in ${expiryMinutes} minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Pharmetis - ${title}\n\nYour OTP code is: ${otpCode}\n\nThis code will expire in ${expiryMinutes} minutes.\n\nIf you didn't request this code, please ignore this email.`
    };

    const info = await mailTransporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email} (${isPasswordReset ? 'password_reset' : isRegistration ? 'registration' : 'login'}): ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}:`, error?.message || error);
    throw new Error(`Failed to send email: ${error?.message || error}`);
  }
};

/**
 * Send password reset OTP email (supplier forgot password - 6 digit OTP).
 * Reuses sendOTPEmail with purpose 'password_reset' so it uses the same transporter as registration OTP.
 */
export const sendPasswordResetOTPEmail = async (email, otpCode) => {
  return sendOTPEmail(email, otpCode, false, 'password_reset');
};

/**
 * Send password reset email (supplier forgot password - link)
 */
export const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const mailTransporter = createTransporter();
    const mailOptions = {
      from: `"Pharmetis Platform" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Supplier Portal Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Reset Password</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Pharmetis Supplier Portal</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Reset your password</h2>
            <p>You requested a password reset. Click the button below to set a new password. This link expires in 15 minutes.</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
            </p>
            <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${resetLink}">${resetLink}</a></p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
          </div>
        </body>
        </html>
      `,
      text: `Reset your password: ${resetLink}\n\nThis link expires in 15 minutes. If you didn't request this, ignore this email.`
    };
    const info = await mailTransporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send a generic email
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailTransporter = createTransporter();

    const mailOptions = {
      from: `"Pharmetis Platform" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version if not provided
    };

    const info = await mailTransporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const verifyEmailConnection = async () => {
  try {
    const mailTransporter = createTransporter();
    await mailTransporter.verify();
    logger.info('Email service connection verified');
    return true;
  } catch (error) {
    logger.error('Email service connection failed:', error);
    return false;
  }
};
