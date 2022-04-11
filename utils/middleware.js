const logger = require('./logger');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const errorHandler = (error, _req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'Invalid token' });
  }
  logger.error(error.message);

  next(error);
};

const requestLogger = (request, _response, next) => {
  logger.info(`${request.method} ${request.path}`);
  logger.info('Request body:  ', request.body);
  logger.info('------------------------');
  next();
};

const tokenExtractor = (request, _response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    request.token = authorization.substring(7);
  }
  next();
};

const unknownEndpoint = (_req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const userExtractor = async (request, response, next) => {
  const token = request.token;
  let decodedToken = null;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (error) {
    next(error);
  }

  if (!token || !decodedToken.id) {
    return response
      .status(401)
      .json({ error: 'Token missing or invalid' })
      .end();
  }
  const user = await User.findById(decodedToken.id);
  request.user = user;
  next();
};

module.exports = {
  errorHandler,
  requestLogger,
  tokenExtractor,
  unknownEndpoint,
  userExtractor,
};
