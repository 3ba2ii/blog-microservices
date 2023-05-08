import express, { Application, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { urlencoded } from 'body-parser';

const app: Application = express();

app.use(urlencoded({ extended: true }));
app.use(express.json());

const PORT: number = 3000;

const posts: Record<string, any> = {};

app.get('/posts', (req: Request, res: Response): void => {
  res.send(posts);
});
app.post('/posts', (req: Request, res: Response): void => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;
  posts[id] = {
    id,
    title,
  };
  res.status(201).send(posts[id]);
});
app.use('/', (req: Request, res: Response): void => {
  res.send('Hello world!');
});

app.listen(PORT, (): void => {
  console.log('SERVER IS UP ON PORT:', PORT);
});
