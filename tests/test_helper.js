const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
]

const blogsInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({
    author: 'nobody',
    title: 'willremovethissoon',
    url: 'www.nowhere.com',
    likes: 404,
  })
  await blog.save()
  await blog.deleteOne()

  return blog.id
}

const usersInDB = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

const initialUsers = [
  {
    id: '625439e06676528bae335ae8',
    name: 'Superuser',
    username: 'root',
    password: 'sekret',
  },
  {
    id: '6254779e28f26363f88f24cb',
    username: 'mikecheck',
    name: 'Mike Check',
    password: 'testingtesting',
  },
]

const initDbWithUsers = async () => {
  await User.deleteMany({})
  for (let user of initialUsers) {
    let userObject = new User({
      _id: user.id,
      name: user.name,
      username: user.username,
      passwordHash: await bcrypt.hash(user.password, 10),
      __v: 0,
    })
    await userObject.save()
  }
}

const createToken = (username, userId) => {
  const token = jwt.sign({ username: username, id: userId }, process.env.SECRET)
  return `Bearer ${token}`
}

module.exports = {
  blogsInDB,
  initDbWithUsers,
  createToken,
  initialBlogs,
  nonExistingId,
  usersInDB,
  initialUsers,
}
