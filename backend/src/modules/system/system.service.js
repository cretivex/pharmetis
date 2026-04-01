import os from 'os';

let eventLoopLastCheck = 0;
let eventLoopDelayMs = 0;

function measureEventLoopDelay() {
  const start = Date.now();
  setImmediate(() => {
    eventLoopDelayMs = Date.now() - start;
    eventLoopLastCheck = Date.now();
  });
}

/**
 * Get current system metrics for operational visibility.
 */
export async function getSystemMetrics() {
  measureEventLoopDelay();

  const mem = process.memoryUsage();
  const loadAvg = os.loadavg();
  const cpuLoad = loadAvg[0] !== undefined ? Math.min(100, Math.round(loadAvg[0] * 100) / 100) : 0;

  const metrics = {
    memoryUsage: {
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      rssMb: Math.round(mem.rss / 1024 / 1024),
      externalMb: Math.round((mem.external || 0) / 1024 / 1024)
    },
    cpuLoad: Number(cpuLoad),
    dbPoolSize: 0, // Prisma does not expose pool size; set by anomaly/metrics layer if available
    eventLoopDelayMs: eventLoopLastCheck ? eventLoopDelayMs : 0,
    timestamp: new Date().toISOString()
  };

  return metrics;
}
