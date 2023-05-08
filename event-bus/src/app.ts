import express, { Application, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import axios from 'axios';
const app: Application = express();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(express.json());

const PORT: number = 5555;

const listeners: Set<string> = new Set();

app.post('/events', async (req: Request, res: Response) => {
  const event = req.body;
  console.log('Event Received:', event.type);
  listeners.forEach((listenerURL: string) => {
    axios.post(listenerURL, event);
  });
  res.send({ status: 'OK' });
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
