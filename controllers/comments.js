// We need to merge params to make blogId available in our Items router
const commentsRouter = require('express').Router({ mergeParams: true })
const Comment = require('../models/comment')
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

commentsRouter.get('/', async (request, response) => {
  console.log('Requesting comments for blog', request.params.blogId)
  const blog = await Blog.findById(request.params.blogId).populate('comments', {
    content: 1,
    id: 1,
  })

  if (blog) {
    response = response.json(blog.comments)
  } else {
    response.status(404).end()
  }
})

commentsRouter.post('/', userExtractor, async (request, response) => {
  const { body } = request

  const blog = await Blog.findById(request.params.blogId)

  if (!blog) {
    return response.status(404).json({ error: 'Blog not found.' })
  }

  const comment = new Comment({
    content: body.content,
    blog: blog._id,
  })

  const savedComment = await comment.save()
  blog.comments = blog.comments.concat(savedComment._id)
  await blog.save()
  response.status(201).json(savedComment)
})

module.exports = commentsRouter
