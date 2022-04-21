const router = require('express').Router();
const User = require('../models/user');
const Blog = require('../models/blog');

router.post('/reset', async (_request, response) => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  response.status(204).end();
});

module.exports = router;
