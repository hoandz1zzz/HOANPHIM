import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import authRoutes from './routes/auth.routes';

dotenv.config();

const PORT = Number(process.env.PORT) || 4001;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

app.use('/', authRoutes);

app.listen(PORT, () => {
  console.log(`[auth-service] listening on http://localhost:${PORT}`);
});
