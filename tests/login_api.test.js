const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

beforeEach(async () => {
  try {
    // Add user to database (so there is a user that can be attached to blogs)
    await helper.initDbWithUsers()
  } catch (error) {
    console.log('Error initalizing database', error)
  }
})

describe('login', () => {
  test('succeeds when username and password are correct', async () => {
    const [user, ..._] = helper.initialUsers
    await api
      .post('/api/login')
      .send({ username: user.username, password: user.password })
      .expect(200)
  })

  test('fails if username is missing', async () => {
    const [user, ..._] = helper.initialUsers
    await api.post('/api/login').send({ password: user.password }).expect(401)
  })

  test('fails if password is incorrect', async () => {
    const [user, ..._] = helper.initialUsers
    await api
      .post('/api/login')
      .send({ username: user.username, password: user.password + '123' })
      .expect(401)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
