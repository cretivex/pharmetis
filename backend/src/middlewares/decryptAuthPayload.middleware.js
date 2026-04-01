import CryptoJS from 'crypto-js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const decryptAuthPayload = (req, _res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  const encryptedData = req.body.data;
  if (!encryptedData) {
    return next();
  }

  if (typeof encryptedData !== 'string' || !encryptedData.trim()) {
    return next(new ApiError(400, 'Invalid encrypted payload'));
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, env.PAYLOAD_SECRET);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error('Decryption failed');
    }

    const parsed = JSON.parse(decryptedText);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid decrypted object');
    }

    req.body = parsed;
    return next();
  } catch (_error) {
    const hint =
      env.IS_DEVELOPMENT
        ? ' Check that backend PAYLOAD_SECRET and frontend VITE_PAYLOAD_SECRET are identical (restart Vite after changing .env).'
        : '';
    return next(new ApiError(400, `Unable to decrypt authentication payload.${hint}`));
  }
};
