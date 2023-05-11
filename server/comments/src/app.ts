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
const eventBusUrl: string = 'http://event-bus-srv:5555';
axios
  .post(`${eventBusUrl}/subscribe`, {
    url: `http://comments-srv:${PORT}/events`,
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
  '/posts/:id/comments/create',
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

    const comments = commentsPerPostId?.[postId] || [];

    comments.push({ id, content, status: 'PENDING' });

    commentsPerPostId[postId] = comments;
    //send event to event bus
    axios
      .post(`${eventBusUrl}/events`, {
        type: 'CommentCreated',
        data: {
          id,
          content,
          postId,
          status: 'PENDING',
        },
      })
      .catch(console.error);
    res.status(201).send(comments);
  }
);

app.post('/events', (req: Request, res: Response) => {
  console.log('Received Event:', req.body.type);
  const { type, data } = req.body;
  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;
    const comments = commentsPerPostId?.[postId] || [];
    const comment = comments.find((comment: any) => comment.id === id);
    if (comment) {
      comment.status = status;
      axios
        .post(`${eventBusUrl}/events`, {
          type: 'CommentUpdated',
          data: {
            id,
            postId,
            status,
            content,
          },
        })
        .catch(console.error);
    }
  }
  res.send({ status: 'OK' });
});
app.use('/', (req: Request, res: Response): void => {
  res.send('Hello world!');
});

app.listen(PORT, (): void => {
  console.log('SERVER IS UP ON PORT:', PORT);
});
