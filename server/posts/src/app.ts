import express, { Application, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import axios from 'axios';
const app: Application = express();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(express.json());

const PORT: number = 3000;

const posts: Record<string, any> = {};

axios
  .post('http://localhost:5555/subscribe', {
    url: 'http://localhost:3000/events',
  })
  .then((res) => {
    console.log(res.data);
  });
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
  axios.post('http://localhost:5555/events', {
    type: 'PostCreated',
    data: {
      id,
      title,
    },
  });
  res.status(201).send(posts[id]);
});

app.post('/events', (req: Request, res: Response) => {
  console.log('Received Event:', req.body.type);
  res.send({});
});
app.use('/', (req: Request, res: Response): void => {
  res.send('Hello world!');
});

app.listen(PORT, (): void => {
  console.log('SERVER IS UP ON PORT:', PORT);
});
