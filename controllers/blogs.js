const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const body = request.body;
  const blog = new Blog({
    likes: body.likes || 0,
    ...body,
  });
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog.toJSON());
  } else {
    response.status(404).end();
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

blogsRouter.patch('/:id', async (request, response) => {
  const updated = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (updated) {
    response.json(updated.toJSON());
  } else {
    response.status(404).end();
  }
});

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body;
  let errors = [];
  if (!body.author) errors.push('Author name missing');
  if (!body.title) errors.push('Title missing');
  if (!body.url) errors.push('Blog url missing');
  if (!body.likes) errors.push('Like count missing');

  if (errors.length > 0) {
    response
      .status(400)
      .json({ error: errors.join(' ') })
      .end();
  }

  const updated = await Blog.findByIdAndUpdate(request.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (updated) {
    response.json(updated.toJSON());
  } else {
    response.status(404).end();
  }
});

module.exports = blogsRouter;
