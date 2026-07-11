// require('dotenv').config({path: '.env'});
import dotenv from 'dotenv';
dotenv.config({path: '.env'});
import app from './app.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './db/index.js';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
        if (!origin || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(null, process.env.CORS_ORIGIN);
        }
    },
    credentials: true,
  }
});

const userSockets = new Map();
app.set('io', io);
app.set('userSockets', userSockets);

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of userSockets.entries()) {
      if (sockId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

connectDB()
.then(()=>{
      server.listen(process.env.PORT ||3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
      })
})
.catch((error)=>{
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});