const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (_request, response) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
    id: 1,
  })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body

  if (!username)
    return response.status(400).json({ error: 'Username is required.' })

  const existingUser = await User.findOne({ username })

  if (existingUser) {
    return response.status(400).json({ error: 'Username is already taken.' })
  }

  if (!password) {
    return response.status(400).json({ error: 'Password is required.' })
  }
  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: 'Password must be at least 3 characters long.' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
    id: 1,
  })

  if (user) {
    response.json(user.toJSON())
  } else {
    response.status(404).end()
  }
})

// usersRouter.delete('/:id', ...)

module.exports = usersRouter
