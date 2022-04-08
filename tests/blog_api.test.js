const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const helper = require('./test_helper');

beforeEach(async () => {
  try {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs, { ordered: false });
  } catch (error) {
    console.log('Error initalizing database', error);
  }
});

describe('when there is initially some blog posts saved', () => {
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
});

describe('viewing a specific blog post', () => {
  test.skip('succeeds when id is valid', async () => {});

  test.skip('fails with statuscode 404 if blog post does not exist', async () => {});

  test.skip('fails with statuscode 400 id is invalid', async () => {});
});

describe('creating a new blog post', () => {
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

  test('blog likes will default to value 0', async () => {
    const newBlog = {
      title: 'About coding the FizzBuzz interview question',
      author: 'Michele Riva',
      url: 'https://micheleriva.medium.com/about-coding-the-fizzbuzz-interview-question-9bcd08d9dfe5',
    };

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    expect(response.body.likes).toEqual(0);
  });

  test('blog without url and title will be rejected', async () => {
    const newBlog = {
      author: 'Unknown blogger',
    };

    await api.post('/api/blogs').send(newBlog).expect(400);
    const blogsAfter = await helper.blogsInDB();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length);
  });
});

describe('deleting a blog post', () => {
  test.skip('succeeds with status code 204 if id is valid', async () => {});
});

afterAll(() => {
  mongoose.connection.close();
});
