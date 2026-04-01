import { sendOTPService, verifyOTPService, resendOTPService } from './otp.service.js';
import { sendRegistrationOTPService, verifyRegistrationOTPService, resendRegistrationOTPService } from './otp-register.service.js';
import { logger } from '../../utils/logger.js';
import { setAuthCookies } from '../../utils/authCookies.js';

export const sendOTPController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await sendOTPService(email, false); // false = login, not registration

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        expiresAt: result.expiresAt
      }
    });
  } catch (error) {
    logger.error('Send OTP controller error:', error);
    next(error);
  }
};

export const sendRegistrationOTPController = async (req, res, next) => {
  try {
    const { email, fullName, companyName } = req.body;

    const result = await sendRegistrationOTPService(email, fullName, companyName);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        expiresAt: result.expiresAt
      }
    });
  } catch (error) {
    logger.error('Send registration OTP controller error:', error);
    next(error);
  }
};

export const verifyRegistrationOTPController = async (req, res, next) => {
  try {
    const { email, otp, fullName, companyName, password } = req.body;

    const result = await verifyRegistrationOTPService(email, otp, fullName, companyName, password);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: result.user
      }
    });
  } catch (error) {
    logger.error('Verify registration OTP controller error:', error);
    next(error);
  }
};

export const resendRegistrationOTPController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await resendRegistrationOTPService(email);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        expiresAt: result.expiresAt
      }
    });
  } catch (error) {
    logger.error('Resend registration OTP controller error:', error);
    next(error);
  }
};

export const verifyOTPController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const result = await verifyOTPService(email, otp);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user
      }
    });
  } catch (error) {
    logger.error('Verify OTP controller error:', error);
    next(error);
  }
};

export const resendOTPController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await resendOTPService(email);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        expiresAt: result.expiresAt
      }
    });
  } catch (error) {
    logger.error('Resend OTP controller error:', error);
    next(error);
  }
};
