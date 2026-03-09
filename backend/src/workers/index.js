import { Worker } from 'bullmq';
import { getRedisConnection } from '../queues/connection.js';
import { logger } from '../utils/logger.js';

let connection;
try {
  connection = getRedisConnection();
} catch (err) {
  logger.error('Worker: Redis connection failed', { error: err?.message });
  process.exit(1);
}

async function processAuditExport(job) {
  const { filters, requestedBy } = job.data || {};
  logger.info('[Worker] audit-export job', { jobId: job.id, requestedBy });
  // Placeholder: actual export would call audit-logs service and write file / store URL
  return { done: true, rows: 0 };
}

async function processAnalytics(job) {
  const { query, requestedBy } = job.data || {};
  logger.info('[Worker] analytics job', { jobId: job.id, requestedBy });
  // Placeholder: run heavy analytics query
  return { done: true };
}

async function processCsvExport(job) {
  const { type, params, requestedBy } = job.data || {};
  logger.info('[Worker] csv-export job', { jobId: job.id, type, requestedBy });
  // Placeholder: generate CSV and store or email
  return { done: true };
}

const auditExportWorker = new Worker(
  'audit-export',
  async (job) => processAuditExport(job),
  { connection, concurrency: 2 }
);

const analyticsWorker = new Worker(
  'analytics',
  async (job) => processAnalytics(job),
  { connection, concurrency: 1 }
);

const csvExportWorker = new Worker(
  'csv-export',
  async (job) => processCsvExport(job),
  { connection, concurrency: 2 }
);

[auditExportWorker, analyticsWorker, csvExportWorker].forEach((w) => {
  w.on('completed', (job) => logger.info('[Worker] job completed', { name: job.name, id: job.id }));
  w.on('failed', (job, err) => logger.warn('[Worker] job failed', { name: job?.name, id: job?.id, error: err?.message }));
});

logger.info('Workers started: audit-export, analytics, csv-export');
