const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body;

  if (!body.title) {
    return response.status(400).json({
      error: 'Missing blog post title',
    });
  }

  if (!body.url) {
    return response.status(400).json({
      error: 'Missing blog post url',
    });
  }

  const blog = new Blog({
    likes: body.likes || 0,
    ...body,
  });
  try {
    const savedBlog = await blog.save();
    response.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
