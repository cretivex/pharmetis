/**
 * Anomaly detection: track auth failures, error rate, API latency.
 * When thresholds are exceeded, calls sendSystemAlert (rate-limited there).
 */
import { sendSystemAlert } from './alert.service.js';
import { logger } from '../utils/logger.js';

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const AUTH_FAILURE_THRESHOLD = 10;
const ERROR_COUNT_THRESHOLD = 20;
const LATENCY_P99_THRESHOLD_MS = 5000;

const authFailureTimestamps = [];
const errorTimestamps = [];
const latencySamples = [];

function pruneOld(arr, maxAgeMs) {
  const cutoff = Date.now() - maxAgeMs;
  while (arr.length && arr[0] < cutoff) arr.shift();
}

function pruneLatency() {
  const cutoff = Date.now() - WINDOW_MS;
  while (latencySamples.length && latencySamples[0].t < cutoff) latencySamples.shift();
}

export function recordAuthFailure() {
  authFailureTimestamps.push(Date.now());
  pruneOld(authFailureTimestamps, WINDOW_MS);
  checkAuthSpike();
}

export function recordError() {
  errorTimestamps.push(Date.now());
  pruneOld(errorTimestamps, WINDOW_MS);
  checkErrorRate();
}

export function recordLatency(ms) {
  if (typeof ms !== 'number' || ms < 0) return;
  latencySamples.push({ t: Date.now(), ms });
  pruneLatency();
  checkLatency();
}

function checkAuthSpike() {
  pruneOld(authFailureTimestamps, WINDOW_MS);
  if (authFailureTimestamps.length >= AUTH_FAILURE_THRESHOLD) {
    sendSystemAlert(
      'auth_spike',
      `Auth failures in last 5 min: ${authFailureTimestamps.length} (threshold: ${AUTH_FAILURE_THRESHOLD})`
    ).catch((err) => logger.warn('Anomaly sendSystemAlert failed', { error: err?.message }));
  }
}

function checkErrorRate() {
  pruneOld(errorTimestamps, WINDOW_MS);
  if (errorTimestamps.length >= ERROR_COUNT_THRESHOLD) {
    sendSystemAlert(
      'db_issue',
      `Error count in last 5 min: ${errorTimestamps.length} (threshold: ${ERROR_COUNT_THRESHOLD})`
    ).catch((err) => logger.warn('Anomaly sendSystemAlert failed', { error: err?.message }));
  }
}

function checkLatency() {
  pruneLatency();
  if (latencySamples.length < 10) return;
  const sorted = latencySamples.map((s) => s.ms).sort((a, b) => a - b);
  const p99Index = Math.floor(sorted.length * 0.99);
  const p99 = sorted[p99Index];
  if (p99 >= LATENCY_P99_THRESHOLD_MS) {
    sendSystemAlert(
      'high_latency',
      `API latency p99 in last 5 min: ${p99}ms (threshold: ${LATENCY_P99_THRESHOLD_MS}ms)`
    ).catch((err) => logger.warn('Anomaly sendSystemAlert failed', { error: err?.message }));
  }
}
