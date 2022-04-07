const { beforeEach, expect } = require('@jest/globals');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const helper = require('./test_helper');

beforeEach(async () => {
  await Blog.deleteMany({});
  Blog.insertMany(
    helper.initialBlogs,
    { ordered: false },
    function (error, _docs) {
      if (error) {
        throw Error('Initializing database failed!');
      }
    }
  );
});

test('blog posts are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('all blog posts are returned', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('specific blog post is within returned posts', async () => {
  const response = await api.get('/api/blogs');
  const titles = response.body.map((b) => b.title);
  expect(titles).toContain('Go To Statement Considered Harmful');
});

test('blog identifier is called id', async () => {
  const response = await api.get('/api/blogs');
  const blog = response.body[0];
  expect(blog.id).toBeDefined();
});

test('new blog post is saved to the database', async () => {
  const newBlog = {
    title: 'How a Web Design Goes Straight to Hell',
    author: 'Matthew Inman',
    url: 'https://theoatmeal.com/comics/design_hell',
    likes: 100,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAfter = await helper.blogsInDB();
  expect(blogsAfter).toHaveLength(helper.initialBlogs.length + 1);

  const titles = blogsAfter.map((b) => b.title);
  expect(titles).toContain(newBlog.title);
});

afterAll(() => {
  mongoose.connection.close();
});
