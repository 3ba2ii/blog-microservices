import express, { Application, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import axios from 'axios';

const app: Application = express();
app.use(cors());

app.use(urlencoded({ extended: true }));
app.use(express.json());

const PORT: number = 4000;

const commentsPerPostId: Record<string, any> = {};

axios
  .post(`http://localhost:5555/subscribe`, {
    url: `http://localhost:${PORT}/events`,
  })
  .then((res) => {
    console.log(res.data);
  });
app.get('/posts/:id/comments', (req: Request, res: Response): void => {
  const postId = req?.params?.id;
  if (!postId) {
    res.status(400).send('Invalid post id');
    return;
  }
  const comments = commentsPerPostId?.[postId] || [];
  res.status(201).send(comments);
});
app.post(
  '/posts/:id/comments',
  async (req: Request, res: Response): Promise<void> => {
    const id = randomBytes(4).toString('hex');
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Invalid content' });
      return;
    }
    const postId = req?.params?.id;
    if (!postId) {
      res.status(400).send('Invalid post id');
      return;
    }

    await axios
      .post('http://localhost:5555/events', {
        type: 'CommentCreated',
        data: {
          id,
          content,
          postId,
        },
      })
      .catch((err) => {
        console.log('🚀 ~ file: app.ts ~ line 149 ~ .then ~ err', err);
      });
    const comments = commentsPerPostId?.[postId] || [];
    comments.push({ id, content });
    commentsPerPostId[postId] = comments;
    res.status(201).send(comments);
  }
);

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
