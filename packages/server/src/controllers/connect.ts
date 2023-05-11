import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/chat')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));