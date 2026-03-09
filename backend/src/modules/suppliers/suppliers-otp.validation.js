import Joi from 'joi';

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otpCode: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only numbers'
  })
});

export const resendOTPSchema = Joi.object({
  email: Joi.string().email().required()
});
