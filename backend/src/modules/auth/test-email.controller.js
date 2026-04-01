import { verifySMTPConnection, sendOTPEmail } from '../../services/smtp.service.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

export const testEmailConnection = async (req, res, next) => {
  try {
    logger.info('Testing SMTP connection...');
    const emailUser = env.SMTP_USER || env.EMAIL_USER;
    const host = env.SMTP_HOST || 'smtp.gmail.com';
    const port = env.SMTP_PORT || 587;
    logger.info(`Email config: ${host}:${port}, User: ${emailUser ? emailUser.substring(0, 3) + '***' : 'not set'}`);

    const isConnected = await verifySMTPConnection();

    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'Email connection successful',
        config: {
          host,
          port,
          user: emailUser ? `${emailUser.substring(0, 3)}***` : 'not set',
          from: env.SMTP_FROM || env.EMAIL_USER || 'not set'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email connection failed. Check EMAIL_USER and EMAIL_PASS in .env.',
        config: {
          host,
          port,
          user: emailUser ? `${emailUser.substring(0, 3)}***` : 'not set'
        }
      });
    }
  } catch (error) {
    logger.error('Test email connection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to test SMTP connection',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const sendTestEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    logger.info(`Sending test email to ${email}...`);
    
    const testOTP = '123456';
    await sendOTPEmail(email, testOTP);
    
    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}. Check your inbox.`,
      note: 'This is a test email. The OTP shown (123456) is not valid for login.'
    });
  } catch (error) {
    logger.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send test email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      hint: 'For Gmail, make sure you are using an App Password, not your regular password.'
    });
  }
};
