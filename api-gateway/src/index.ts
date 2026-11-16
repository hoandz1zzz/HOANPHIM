import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { optionalAuth } from './middleware/optionalAuth';

dotenv.config();

const PORT = Number(process.env.PORT) || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:4002';
const INTERACTION_SERVICE_URL = process.env.INTERACTION_SERVICE_URL || 'http://localhost:4003';

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

app.use(optionalAuth);

function buildProxyOptions(target: string, serviceName: string): Options {
  return {
    target,
    changeOrigin: true,
    on: {
      error: (err, _req, res) => {
        console.error(`[Proxy Error] ${serviceName}:`, err.message);
        if ('headersSent' in res && !res.headersSent && 'status' in res) {
          (res as Response).status(502).json({
            error: 'Bad Gateway',
            message: `Upstream service ${serviceName} is unavailable`,
          });
        }
      },
    },
  };
}

app.use('/api/auth', createProxyMiddleware(buildProxyOptions(AUTH_SERVICE_URL, 'auth-service')));
app.use('/api/catalog', createProxyMiddleware(buildProxyOptions(CATALOG_SERVICE_URL, 'catalog-service')));
app.use(
  '/api/interactions',
  createProxyMiddleware(buildProxyOptions(INTERACTION_SERVICE_URL, 'interaction-service'))
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`[api-gateway] listening on http://localhost:${PORT}`);
});
