import express, { Application, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import axios from 'axios';

const app: Application = express();
app.use(cors());

app.use(urlencoded({ extended: true }));
app.use(express.json());

const PORT: number = 3002;
const eventBusUrl: string = 'http://event-bus-srv:5555';

axios
  .post(`${eventBusUrl}/subscribe`, {
    url: `http://moderation-srv:${PORT}/events`,
  })
  .then((res) => {
    console.log(res.data);
  });

app.post(
  '/moderate/comment',
  async (req: Request, res: Response): Promise<void> => {}
);

app.post('/events', async (req: Request, res: Response) => {
  console.log('Received Event:', req.body.type);
  const { type, data } = req.body;
  if (type === 'CommentCreated') {
    //sleep for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const { id, postId, status, content } = data;
    if (!id || !postId || !status || !content) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const response = {
      id,
      postId,
      status: content.includes('orange') ? 'REJECTED' : 'APPROVED',
      content,
    };
    //send a request to event bus to update the status of the comment (that will be redirected to the comment service)
    await axios.post(`${eventBusUrl}/events`, {
      type: 'CommentModerated',
      data: response,
    });
    return res.status(200).send(response);
  }
  res.status(200).send({
    message: 'Event received',
  });
});

app.listen(PORT, (): void => {
  console.log('SERVER IS UP ON PORT:', PORT);
});
