const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

/**
 * Get token (delivered using brearer scheme) from authorization header
 */
const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    return authorization.substring(7);
  }
  return null;
};

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    id: 1,
    name: 1,
    username: 1,
  });
  response.json(blogs);
});

/**
 * Store a new blog post (requires token authentication)
 * User whose id is in the token will be associated with the post.
 */
blogsRouter.post('/', async (request, response, next) => {
  const body = request.body;
  const token = getTokenFrom(request);
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
  const blog = new Blog({
    likes: body.likes || 0,
    user: user._id,
    ...body,
  });
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

/**
 * Get individual blog posts
 */
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {
    id: 1,
    name: 1,
    username: 1,
  });
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
  } else {
    const updated = await Blog.findByIdAndUpdate(request.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (updated) {
      response.json(updated.toJSON());
    } else {
      response.status(404).end();
    }
  }
});

module.exports = blogsRouter;
