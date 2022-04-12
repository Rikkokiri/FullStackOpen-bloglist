const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
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

  test('individual user can be requested', async () => {
    const [user, ..._] = await helper.usersInDB();
    const response = await api
      .get(`/api/users/${user.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toEqual(user);
  });

  test('viewing nonexistant user fails with code 404', async () => {
    const validNonexistantId = await helper.nonExistingId();
    await api.get(`/api/users/${validNonexistantId}`).expect(404);
  });

  test('viewing user fails with code 400 if id is invalid', async () => {
    await api.get('/api/users/invalidid').expect(400);
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

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const userAtStart = await helper.usersInDB();
    const newUser = {
      username: 'root',
      name: 'James Bond',
      password: 'topsecret',
    };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(userAtStart.length);
    const names = usersAtEnd.map((u) => u?.name);
    expect(names).not.toContain(newUser.name);
  });
});

describe('creating user', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('succeeds without name of user (different from username)', async () => {
    const userAtStart = await helper.usersInDB();
    const newUser = {
      username: 'agent007',
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

  test('fails if password is too short', async () => {
    const userAtStart = await helper.usersInDB();
    await api
      .post('/api/users')
      .send({
        username: 'agent007',
        password: 'jk',
      })
      .expect(400);
    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(userAtStart.length);
  });

  test('fails if username is too short', async () => {
    const userAtStart = await helper.usersInDB();
    await api
      .post('/api/users')
      .send({
        username: 'ha',
        password: 'somegreatpassword',
      })
      .expect(400);
    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(userAtStart.length);
  });

  test('fails if password is missing', async () => {
    const userAtStart = await helper.usersInDB();
    const response = await api
      .post('/api/users')
      .send({
        username: 'agent007',
      })
      .expect(400);
    expect(response.body.error).toEqual('Password is required.');
    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(userAtStart.length);
  });

  test('fails if username is missing', async () => {
    const userAtStart = await helper.usersInDB();
    const { body } = await api
      .post('/api/users')
      .send({
        password: 'forgotprovideusername',
      })
      .expect(400);
    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(userAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
