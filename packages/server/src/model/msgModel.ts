import mongoose from 'mongoose';

interface Message {
    _id: string;
    sender: string;
    content: string;
    timestamp: number;
  }
const MessageSchema = new mongoose.Schema({
    sender: String,
    content: String,
    timestamp: Number
  });
const MessageModel = mongoose.model<Message>('Message', MessageSchema);
export default MessageModel