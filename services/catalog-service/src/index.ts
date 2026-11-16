import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import './config/redis';
import catalogRoutes from './routes/catalog.routes';

dotenv.config();

const PORT = Number(process.env.PORT) || 4002;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'catalog-service' });
});

app.use('/', catalogRoutes);

app.listen(PORT, () => {
  console.log(`[catalog-service] listening on http://localhost:${PORT}`);
});
