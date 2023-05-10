import axios from 'axios';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
const app: Application = express();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(express.json());

const PORT: number = 5555;

const listeners: Set<string> = new Set();

app.post('/events', async (req: Request, res: Response) => {
  const event = req.body;
  try {
    listeners.forEach((listenerURL: string) => {
      axios.post(listenerURL, event).catch(console.error);
    });
  } catch (error) {
    res.status(500).send({ status: 'FAILED', error: error });
  }
});

app.post('/subscribe', (req: Request, res: Response) => {
  const { url } = req.body;
  listeners.add(url);
  console.log(`🚀 ~ file: app.ts:27 ~ app.post ~ listeners:`, listeners);
  res.status(200).send({ status: 'OK' });
});
app.listen(PORT, (): void => {
  console.log('SERVER IS UP ON PORT:', PORT);
});
