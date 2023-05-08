import express, { Application, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import axios from 'axios';
const app: Application = express();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(express.json());

const PORT: number = 6000;

const posts: Record<
  string,
  {
    id: string;
    title: string;
    comments?: {
      id: string;
      content: string;
    }[];
  }
> = {};

axios
  .post('http://localhost:5555/subscribe', {
    url: `http://localhost:${PORT}/events`,
  })
  .then((res) => {
    console.log(res.data);
  });
app.get('/posts', (_req: Request, res: Response): void => {
  res.send(posts);
});

app.post('/events', (req: Request, res: Response) => {
  console.log('Received Event:', req.body.type);
  const { type, data } = req.body;
  if (type === 'PostCreated') {
    if (!data.id) return res.status(400).send({ error: 'Post id is required' });
    if (!data.title)
      return res.status(400).send({ error: 'Post title is required' });
    if (data.id in posts) {
      return res.status(409).send({ error: 'Post already exists' });
    }
    posts[data.id] = {
      id: data.id,
      title: data.title,
    };
  } else if (type === 'CommentCreated') {
    if (!data.id)
      return res.status(400).send({ error: 'Comment id is required' });
    if (!data.content)
      return res.status(400).send({ error: 'Comment content is required' });
    if (!data.postId)
      return res.status(400).send({ error: 'Comment postId is required' });
    if (!(data.postId in posts))
      return res.status(404).send({ error: 'Post not found' });
    const { postId, content, id } = data;
    if (!posts[postId]?.comments) {
      posts[postId].comments = [];
    }
    posts[postId].comments?.push({ id, content });

    console.log(posts[postId]);
  }
  res.status(200).send({ status: 'OK' });
});
app.use('/', (req: Request, res: Response): void => {
  res.send('Hello world!');
});

app.listen(PORT, (): void => {
  console.log('SERVER IS UP ON PORT:', PORT);
});