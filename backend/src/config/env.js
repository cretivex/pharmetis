import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'PAYLOAD_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  process.stderr.write('Missing required environment variables:\n');
  missingVars.forEach(varName => process.stderr.write(` - ${varName}\n`));
  process.exit(1);
}

const validateSecrets = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      process.stderr.write('JWT_SECRET must be at least 32 characters in production\n');
      process.exit(1);
    }
  }
};

const validateValues = () => {
  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    process.stderr.write('PORT must be a number between 1 and 65535\n');
    process.exit(1);
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  if (isNaN(saltRounds) || saltRounds < 10 || saltRounds > 15) {
    process.stderr.write('BCRYPT_SALT_ROUNDS must be between 10 and 15\n');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    process.stderr.write('DATABASE_URL is required\n');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL.includes('postgresql://')) {
    process.stderr.write('DATABASE_URL must be a PostgreSQL connection string\n');
    process.exit(1);
  }
};

const convertBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  return false;
};

const convertNumber = (value, defaultValue) => {
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};

validateSecrets();
validateValues();

/** Auth endpoints (login/register/logout/refresh): strict in production, relaxed in development */
const isDevEnv = (process.env.NODE_ENV || 'development') === 'development';
const defaultAuthRateWindowMs = isDevEnv ? 60 * 1000 : 15 * 60 * 1000; // 1 min vs 15 min
const defaultAuthRateMax = isDevEnv ? 200 : 5; // dev: plenty for testing; prod: brute-force protection

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: convertNumber(process.env.PORT, 5000),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
  DATABASE_URL: process.env.DATABASE_URL,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: convertNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    'http://localhost:5173,http://localhost:5174,http://localhost:5175,https://pharmetis.in,https://admin.pharmetis.in,https://supplier.pharmetis.in',
  // Default true: cookie auth needs Access-Control-Allow-Credentials. convertBoolean(undefined) is false; ?? does not replace false.
  CORS_CREDENTIALS:
    process.env.CORS_CREDENTIALS === undefined || process.env.CORS_CREDENTIALS === ''
      ? true
      : convertBoolean(process.env.CORS_CREDENTIALS),
  RATE_LIMIT_WINDOW_MS: convertNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  RATE_LIMIT_MAX_REQUESTS: convertNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: convertBoolean(process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS),
  AUTH_RATE_LIMIT_WINDOW_MS: convertNumber(
    process.env.AUTH_RATE_LIMIT_WINDOW_MS,
    defaultAuthRateWindowMs
  ),
  AUTH_RATE_LIMIT_MAX: convertNumber(process.env.AUTH_RATE_LIMIT_MAX, defaultAuthRateMax),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FORMAT: process.env.LOG_FORMAT || 'combined',
  BODY_LIMIT: process.env.BODY_LIMIT || null,
  API_PREFIX: process.env.API_PREFIX || '/api',
  COOKIE_SECURE:
    process.env.COOKIE_SECURE === undefined || process.env.COOKIE_SECURE === ''
      ? process.env.NODE_ENV === 'production'
      : convertBoolean(process.env.COOKIE_SECURE),
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'Lax',
  COOKIE_HTTP_ONLY:
    process.env.COOKIE_HTTP_ONLY === undefined || process.env.COOKIE_HTTP_ONLY === ''
      ? true
      : convertBoolean(process.env.COOKIE_HTTP_ONLY),
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  OTP_EXPIRY_MINUTES: convertNumber(process.env.OTP_EXPIRY_MINUTES, 5),
  // SMTP Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: convertNumber(process.env.SMTP_PORT, 587),
  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER,
  SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  SMTP_FROM: process.env.SMTP_FROM || process.env.EMAIL_USER,
  // OTP Security
  OTP_MAX_ATTEMPTS: convertNumber(process.env.OTP_MAX_ATTEMPTS, 5),
  OTP_RATE_LIMIT_COUNT: convertNumber(process.env.OTP_RATE_LIMIT_COUNT, 3),
  OTP_RATE_LIMIT_WINDOW: convertNumber(process.env.OTP_RATE_LIMIT_WINDOW, 600000), // 10 minutes
  // Alert delivery (optional)
  ALERT_SLACK_WEBHOOK: process.env.ALERT_SLACK_WEBHOOK,
  ALERT_EMAIL_FROM: process.env.ALERT_EMAIL_FROM,
  ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO,
  REDIS_URL: process.env.REDIS_URL,
  FRONTEND_USER_URL: process.env.FRONTEND_USER_URL || 'http://localhost:5173',
  FRONTEND_ADMIN_URL: process.env.FRONTEND_ADMIN_URL || 'http://localhost:5174',
  FRONTEND_SUPPLIER_URL: process.env.FRONTEND_SUPPLIER_URL || 'http://localhost:5175',
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCES_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_ACCESWS_SECRET_ACCESS_KEY,
  S3_BUCKET: process.env.S3_BUCKET
};
