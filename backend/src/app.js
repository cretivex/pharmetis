import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import prisma from './config/database.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: env.IS_PRODUCTION,
  crossOriginEmbedderPolicy: env.IS_PRODUCTION,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
    if (env.IS_PRODUCTION && allowedOrigins.some(o => o === '*')) {
      logger.warn('CORS wildcard is not allowed in production');
      return callback(new Error('Not allowed by CORS'));
    }
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log for debugging
      logger.warn(`CORS blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: env.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

app.use(compression());

app.use(cookieParser());

app.use(morgan(env.LOG_FORMAT, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

const bodyLimit = env.BODY_LIMIT || (env.IS_PRODUCTION ? '1mb' : '20mb');
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

app.use(env.API_PREFIX, apiRateLimiter);
app.use(env.API_PREFIX, requestLogger);

app.get('/health', async (req, res) => {
  let database = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch (err) {
    logger.error('Health check DB failed:', err?.message);
  }
  const status = database === 'connected' ? 'ok' : 'degraded';
  res.status(database === 'connected' ? 200 : 503).json({
    status,
    database,
    timestamp: new Date().toISOString()
  });
});

// Debug route to list all registered routes
if (env.IS_DEVELOPMENT) {
  app.get('/debug/routes', (req, res) => {
    const routes = [];
    const collectRoutes = (router, prefix = '') => {
      router.stack.forEach((middleware) => {
        if (middleware.route) {
          const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ');
          routes.push(`${methods} ${prefix}${middleware.route.path}`);
        } else if (middleware.name === 'router') {
          const routerPrefix = middleware.regexp.source
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace(/^\^/, '')
            .replace(/\$$/, '');
          collectRoutes(middleware.handle, prefix + routerPrefix);
        }
      });
    };
    collectRoutes(apiRoutes, env.API_PREFIX);
    res.json({ routes, apiPrefix: env.API_PREFIX });
  });
}

app.use(env.API_PREFIX, apiRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
