const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const io = require('socket.io')(7000, {
  cors: {
    origin: process.env.CLOUDINARY_API_SECRET,
  },
});

const verifyAuth = require('./middlewares/verifyAuth');

// eslint-disable-next-line no-unused-vars
const mongoose = require('./config/database.config');

const corsConfig = {
  origin: process.env.SITE_URL,
  credentials: true,
};

const app = express();
app.use(
  express.json({
    limit: '100mb',
  }),
);

// Middlewares
app.use(cookieParser());
app.use(cors(corsConfig));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
const indexRoute = require('./routes/user');
const authorizationRoute = require('./routes/authorization');

app.use('/', indexRoute);
app.use('/isAuthorized', verifyAuth, authorizationRoute);

// Socket Configuration

let activeUsers = [];

io.on('connection', (socket) => {
  socket.on('new-user-add', (newUserId) => {
    console.log(newUserId);
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      });
    }
    io.emit('get-users', activeUsers);
  });

  socket.on('send-message', (obj) => {
    const user = activeUsers.find((user) => user.userId === obj.to);
    console.log(user);

    if (user) {
      io.to(user.socketId).emit('recieve-message', obj.message);
    }
  });
  socket.on('disconnect', () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit('get-users', activeUsers);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
