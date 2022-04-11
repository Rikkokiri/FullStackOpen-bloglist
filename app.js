const config = require('./utils/config');
const express = require('express');
require('express-async-errors'); // Eliminates try-catch
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');
const loginRouter = require('./controllers/login');
const usersRouter = require('./controllers/users');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

logger.info(`Running in ${process.env.NODE_ENV} mode`);
logger.info('Connecting to', config.MONGO_URL);

mongoose
  .connect(config.MONGO_URL)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
