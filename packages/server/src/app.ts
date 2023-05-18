import Koa from 'koa';
import koaSend from 'koa-send';
import koaStatic from 'koa-static';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import MessageModel from './model/msgModel';
import config from '@online-suport-system/config/server'

const app = new Koa();
app.proxy = true;
const httpserver = http.createServer(app.callback());
const io = new Server(httpserver, {
    cors: {
        origin: config.allowOrigin || '*',
        credentials: true,
    },
    pingTimeout: 10000,
    pingInterval: 5000,
});

app.use(
    koaStatic(path.join(__dirname, '../public'), {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        gzip: true
    }))

io.on('connection', (socket) => {
    socket.on('new-message', async (data) => {
        const message = new MessageModel({
            sender: data.sender,
            content: data.content,
            timestamp: Date.now()
        });
        await message.save();
        io.emit('message-added', message);
    });
    socket.on('load-messages', async () => {
        const messages = await MessageModel.find().sort({ timestamp: -1 }).limit(20).lean();
        io.emit('messages-loaded', messages.reverse());
    });
});
/* app.get('/messages', async (req: Request, res: Response) => {
    const messages = await MessageModel.find().sort({ timestamp: -1 }).limit(20).lean();
    res.json(messages.reverse());
});
app.post('/messages', async (req: Request, res: Response) => {
    const { sender, content } = req.body;
    const message = new MessageModel({
        sender,
        content,
        timestamp: Date.now()
    });
    await message.save();
    res.json(message);
    io.emit('message-added', message);
}); */
app.listen(config.port, () => {
    console.log(`Server listening at http://localhost:${config.port}`);
});