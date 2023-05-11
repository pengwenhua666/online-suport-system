import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import http from 'http';
import MessageModel from './model/msgModel';
import config from '@online-suport-system/config/server'

const app = express();
const port = 9527;
const appserver = http.createServer(app);
const io = new Server(appserver, {
    cors: {
        origin: config.allowOrigin || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    pingTimeout: 10000,
    pingInterval: 5000,
});
io.on('connection', (socket) => {
    console.log('Socket.IO connected');
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
app.use(cors());
app.use(bodyParser.json());
app.get('/messages', async (req: Request, res: Response) => {
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
});
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});