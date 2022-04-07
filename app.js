const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');
const logger = require('./utils/logger');

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
// TODO: Request logger

app.use('/api/blogs', blogsRouter);

// TODO: Unknown endpoint
// TODO: Error handler

module.exports = app;
