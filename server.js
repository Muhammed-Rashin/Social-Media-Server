const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const verifyAuth = require('./middlewares/verifyAuth');

// eslint-disable-next-line no-unused-vars
const mongoose = require('./config/database.config');

const corsConfig = {
  origin: true,
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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
