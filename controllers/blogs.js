const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')
const commentsRouter = require('./comments')

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    id: 1,
    name: 1,
    username: 1,
  })
  response.json(blogs)
})

blogsRouter.get('/allDetails', async (_request, response) => {
  const blogs = await Blog.find({})
    .populate('user', {
      id: 1,
      name: 1,
      username: 1,
    })
    .populate('comments', {
      content: 1,
      id: 1,
    })
  response.json(blogs)
})

/**
 * Store a new blog post (requires token authentication)
 * User whose id is in the token will be associated with the post.
 */
blogsRouter.post('/', userExtractor, async (request, response) => {
  const { body, user } = request

  const blog = new Blog({
    likes: body.likes || 0,
    user: user._id,
    ...body,
  })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

/**
 * Get individual blog posts
 */
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate('user', {
      id: 1,
      name: 1,
      username: 1,
    })
    .populate('comments', {
      content: 1,
      id: 1,
    })
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  // Treat blog not found the same as successful deletion
  if (!blog) return response.status(204).end()

  // Validate token (only creator of blog can delete it)
  if (blog.user.toString() !== user._id.toString()) {
    return response
      .status(401)
      .json({ error: 'Only creator of a post can delete it.' })
  }

  await blog.deleteOne()
  response.status(204).end()
})

blogsRouter.patch('/:id', async (request, response) => {
  const updated = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate('user', {
    id: 1,
    name: 1,
    username: 1,
  })

  if (updated) {
    response.json(updated.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  let errors = []
  if (!body.author) errors.push('Author name missing')
  if (!body.title) errors.push('Title missing')
  if (!body.url) errors.push('Blog url missing')
  if (!body.likes) errors.push('Like count missing')

  if (errors.length > 0) {
    response
      .status(400)
      .json({ error: errors.join(' ') })
      .end()
  } else {
    const updated = await Blog.findByIdAndUpdate(request.params.id, body, {
      new: true,
      runValidators: true,
    }).populate('user', {
      id: 1,
      name: 1,
      username: 1,
    })

    if (updated) {
      response.json(updated.toJSON())
    } else {
      response.status(404).end()
    }
  }
})

/**
 * Comments
 */
blogsRouter.use('/:blogId/comments', commentsRouter)

module.exports = blogsRouter
