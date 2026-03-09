import { requestOTPService, verifyOTPService } from './secure-otp.service.js';
import { logger } from '../../utils/logger.js';

export const requestOTPController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await requestOTPService(email);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Request OTP controller error:', error);
    next(error);
  }
};

export const verifyOTPController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const result = await verifyOTPService(email, otp);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    logger.error('Verify OTP controller error:', error);
    next(error);
  }
};
