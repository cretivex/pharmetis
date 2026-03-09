import { Queue } from 'bullmq';
import { getRedisConnection } from './connection.js';

const connection = getRedisConnection();

export const auditExportQueue = new Queue('audit-export', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 }
  }
});

export const analyticsQueue = new Queue('analytics', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 50 },
    attempts: 2,
    backoff: { type: 'exponential', delay: 3000 }
  }
});

export const csvExportQueue = new Queue('csv-export', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 }
  }
});

export async function addAuditExportJob(payload) {
  return auditExportQueue.add('export', payload);
}

export async function addAnalyticsJob(payload) {
  return analyticsQueue.add('run', payload);
}

export async function addCsvExportJob(payload) {
  return csvExportQueue.add('export', payload);
}
