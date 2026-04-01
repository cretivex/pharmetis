import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

let s3ClientInstance = null;

export const hasS3Config = () =>
  Boolean(env.AWS_REGION || process.env.AWS_REGION) &&
  Boolean(env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) &&
  Boolean(env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY) &&
  Boolean(env.S3_BUCKET || process.env.S3_BUCKET);

export const getS3Client = () => {
  if (!s3ClientInstance) {
    const config = {
      region: env.AWS_REGION || 'ap-south-1'
    };
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      };
    }
    s3ClientInstance = new S3Client({
      ...config
    });
  }
  return s3ClientInstance;
};

export const s3Client = getS3Client();

export const S3_PUBLIC_BASE_URL = `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
