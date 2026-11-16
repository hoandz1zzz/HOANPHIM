import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import interactionRoutes from './routes/interaction.routes';

dotenv.config();

const PORT = Number(process.env.PORT) || 4003;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'interaction-service' });
});

app.use('/', interactionRoutes);

app.listen(PORT, () => {
  console.log(`[interaction-service] listening on http://localhost:${PORT}`);
});
