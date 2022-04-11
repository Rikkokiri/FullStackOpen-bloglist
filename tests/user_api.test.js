const { beforeEach, expect } = require('@jest/globals');
const bcrypt = require('bcrypt');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const helper = require('./test_helper');

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({
      name: 'Test User',
      username: 'root',
      passwordHash,
    });
    await user.save();
  });

  test('password hash is not returned from the api', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body[0].passwordHash).not.toBeDefined();
  });

  test('creation succeeds with a fresh username', async () => {
    const userAtStart = await helper.usersInDB();

    const newUser = {
      username: 'agent007',
      name: 'James Bond',
      password: 'topsecret',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(userAtStart.length + 1);
    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test.skip('creation fails with proper statuscode and message if username already taken', async () => {});
});
