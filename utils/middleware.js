const logger = require('./logger');

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

const unknownEndpoint = (_req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

module.exports = {
  errorHandler,
  requestLogger,
  unknownEndpoint,
};
