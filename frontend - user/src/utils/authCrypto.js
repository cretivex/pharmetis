import CryptoJS from 'crypto-js';

const secret = import.meta.env.VITE_PAYLOAD_SECRET;

export function encryptLoginPayload(payload) {
  if (!secret) {
    throw new Error('Missing VITE_PAYLOAD_SECRET');
  }
  return CryptoJS.AES.encrypt(JSON.stringify(payload), secret).toString();
}
