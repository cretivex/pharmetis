import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';
import { sendEmail } from '../../utils/email.js';

const RESET_OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_REQUESTS = 5;
const OTP_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function generate6DigitOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function buildResetOtpEmailHtml(otpCode) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Your Supplier Password</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Pharmetis Supplier Portal</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Reset Your Supplier Password</h2>
    <p>You requested to reset your password. Use the 6-digit OTP below:</p>
    <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="color: #667eea; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${otpCode}</span>
    </div>
    <p style="color: #666; font-size: 14px;">This code expires in ${RESET_OTP_EXPIRY_MINUTES} minutes.</p>
    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send reset OTP: validate supplier email exists, generate 6-digit OTP, save in DB (resetOtp, resetOtpExpires), send email.
 */
export const sendResetOtpSupplierService = async (email) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  if (!normalizedEmail) {
    throw new ApiError(400, 'Email is required');
  }

  logger.info('Sending reset OTP to supplier:', normalizedEmail);

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null,
      role: 'VENDOR'
    },
    include: {
      supplier: true
    }
  });

  if (!user || !user.supplier) {
    logger.warn('Send reset OTP: supplier not found for email:', normalizedEmail);
    return { message: 'If that email is registered as a supplier, you will receive an OTP.' };
  }

  const supplier = user.supplier;
  const now = new Date();
  const resetAt = supplier.resetOtpCountResetAt ? new Date(supplier.resetOtpCountResetAt) : null;

  let count = supplier.resetOtpCount ?? 0;
  if (!resetAt || now > resetAt) {
    count = 0;
  }

  if (count >= MAX_OTP_REQUESTS) {
    throw new ApiError(
      429,
      'Too many OTP requests. Please try again later.'
    );
  }

  const otp = generate6DigitOTP();
  const expires = new Date(Date.now() + RESET_OTP_EXPIRY_MINUTES * 60 * 1000);
  const countResetAt = new Date(Date.now() + OTP_RATE_LIMIT_WINDOW_MS);

  await prisma.supplier.update({
    where: { id: supplier.id },
    data: {
      resetOtp: otp,
      resetOtpExpires: expires,
      resetOtpCount: count + 1,
      resetOtpCountResetAt: count === 0 ? countResetAt : supplier.resetOtpCountResetAt
    }
  });

  try {
    await sendEmail(
      normalizedEmail,
      'Reset Your Supplier Password',
      buildResetOtpEmailHtml(otp),
      `Your password reset OTP is: ${otp}. It expires in ${RESET_OTP_EXPIRY_MINUTES} minutes.`
    );
  } catch (err) {
    logger.error('Email sending failed for reset OTP:', err?.message || err);
    await prisma.supplier.update({
      where: { id: supplier.id },
      data: { resetOtp: null, resetOtpExpires: null, resetOtpCount: count }
    });
    throw new ApiError(500, 'Email sending failed. Please check email configuration or try again later.');
  }

  logger.info('Password reset OTP sent to supplier:', normalizedEmail);
  return { message: 'OTP generated successfully. Check your email.', expiresAt: expires };
};

/**
 * Reset password with OTP: verify email + OTP, then update User password (bcrypt), clear Supplier OTP fields.
 */
export const resetPasswordWithOtpSupplierService = async (email, otp, newPassword) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  if (!normalizedEmail) {
    throw new ApiError(400, 'Email is required');
  }
  const otpTrimmed = (otp || '').trim();
  if (!otpTrimmed || otpTrimmed.length !== 6) {
    throw new ApiError(400, 'Valid 6-digit OTP is required');
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null,
      role: 'VENDOR'
    },
    include: {
      supplier: true
    }
  });

  if (!user || !user.supplier) {
    throw new ApiError(400, 'Invalid email or OTP.');
  }

  const supplier = user.supplier;
  if (!supplier.resetOtp || supplier.resetOtp !== otpTrimmed) {
    throw new ApiError(400, 'Invalid or expired OTP. Please request a new one.');
  }
  if (!supplier.resetOtpExpires || new Date(supplier.resetOtpExpires) < new Date()) {
    await prisma.supplier.update({
      where: { id: supplier.id },
      data: { resetOtp: null, resetOtpExpires: null }
    });
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  const hashedPassword = await bcrypt.hash(newPassword.trim(), env.BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  await prisma.supplier.update({
    where: { id: supplier.id },
    data: { resetOtp: null, resetOtpExpires: null }
  });

  logger.info(`Password reset completed for supplier: ${normalizedEmail}`);
  return { message: 'Password has been reset. You can now sign in.' };
};
