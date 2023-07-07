const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');

beforeEach(async () => {
  try {
    // Add user to database (so there is a user that can be attached to blogs)
    await helper.initDbWithUsers();
    const users = await User.find({});
    const user = users.find((u) => u.username === 'root');

    const blogsWithUser = helper.initialBlogs.map((b) => {
      return { ...b, user: user._id };
    });

    await Blog.deleteMany({});
    await Blog.insertMany(blogsWithUser, { ordered: false });
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
  test('succeeds when id is valid', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToRequest = blogsAtStart[0];

    const result = await api
      .get(`/api/blogs/${blogToRequest.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const resultWithoutUserDetails = {
      ...result.body,
      user: result.body.user.id,
    };
    const processedBlogToRequest = JSON.parse(JSON.stringify(blogToRequest));
    expect(resultWithoutUserDetails).toEqual(processedBlogToRequest);
  });

  test('fails with statuscode 404 if blog post does not exist', async () => {
    const validNonexistantId = await helper.nonExistingId();
    await api.get(`/api/blogs/${validNonexistantId}`).expect(404);
  });

  test('fails with statuscode 400 id is invalid', async () => {
    await api.get('/api/blogs/thisiscertainlynotvalidid').expect(400);
  });
});

describe('creating a new blog post', () => {
  test('new blog post is saved and associated with submitting user', async () => {
    const newBlog = {
      title: 'How a Web Design Goes Straight to Hell',
      author: 'Matthew Inman',
      url: 'https://theoatmeal.com/comics/design_hell',
      likes: 100,
    };
    const [user, ..._] = await helper.usersInDB();
    const response = await api
      .post('/api/blogs')
      .set('Authorization', helper.createToken(user.username, user.id))
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toMatchObject({
      title: newBlog.title,
      author: newBlog.author,
      url: newBlog.url,
      likes: newBlog.likes,
    });

    const blogsAfter = await helper.blogsInDB();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length + 1);

    const titles = blogsAfter.map((b) => b.title);
    expect(titles).toContain(newBlog.title);

    const processedUser = JSON.parse(JSON.stringify(user));
    expect(response.body.user).toEqual(processedUser.id);

    // Check that entry in database is correct
    const newBlogId = response.body.id;
    const newInDb = blogsAfter.find((b) => b.id === newBlogId);

    expect(newInDb).toMatchObject({
      title: newBlog.title,
      author: newBlog.author,
      url: newBlog.url,
      likes: newBlog.likes,
      user: user.id,
    });
  });

  test('blog likes will default to value 0', async () => {
    const newBlog = {
      title: 'About coding the FizzBuzz interview question',
      author: 'Michele Riva',
      url: 'https://micheleriva.medium.com/about-coding-the-fizzbuzz-interview-question-9bcd08d9dfe5',
    };
    const [user, ..._] = await helper.usersInDB();

    const response = await api
      .post('/api/blogs')
      .set('Authorization', helper.createToken(user.username, user.id))
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    expect(response.body.likes).toEqual(0);
  });

  test('blog without an url will be rejected', async () => {
    const newBlog = {
      author: 'Unknown blogger',
      title: 'How to write a blog post',
    };
    const [user, ..._] = await helper.usersInDB();

    await api
      .post('/api/blogs')
      .set('Authorization', helper.createToken(user.username, user.id))
      .send(newBlog)
      .expect(400);
    const blogsAfter = await helper.blogsInDB();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length);
  });

  test('blog without a title will be rejected', async () => {
    const newBlog = {
      author: 'Unknown blogger',
      url: 'https://example.com',
    };
    const [user, ..._] = await helper.usersInDB();

    await api
      .post('/api/blogs')
      .set('Authorization', helper.createToken(user.username, user.id))
      .send(newBlog)
      .expect(400);
    const blogsAfter = await helper.blogsInDB();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length);
  });

  test('blog without url and title will be rejected', async () => {
    const newBlog = {
      author: 'Unknown blogger',
    };
    const [user, ..._] = await helper.usersInDB();

    await api
      .post('/api/blogs')
      .set('Authorization', helper.createToken(user.username, user.id))
      .send(newBlog)
      .expect(400);
    const blogsAfter = await helper.blogsInDB();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length);
  });

  test('request without valid token fails', async () => {
    const newBlog = {
      title: 'How a Web Design Goes Straight to Hell',
      author: 'Matthew Inman',
      url: 'https://theoatmeal.com/comics/design_hell',
      likes: 100,
    };

    await api.post('/api/blogs').send(newBlog).expect(401);

    const blogsAfter = await helper.blogsInDB();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length);

    const titles = blogsAfter.map((b) => b.title);
    expect(titles).not.toContain(newBlog.title);
  });
});

describe('deleting a blog post', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToDelete = blogsAtStart[0];
    const [user, ..._] = await helper.usersInDB();

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', helper.createToken(user.username, user.id))
      .expect(204);

    const blogsAfter = await helper.blogsInDB();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length - 1);
  });

  test('fails with status code 400 if id is invalid', async () => {
    const [user, ..._] = await helper.usersInDB();
    await api
      .delete('/api/blogs/totallyinvalidid')
      .set('Authorization', helper.createToken(user.username, user.id))
      .expect(400);
  });

  test('succeeds with code 204 even if blog does not exist (but id is valid)', async () => {
    const validNonexistantId = await helper.nonExistingId();
    const [user, ..._] = await helper.usersInDB();

    await api
      .delete(`/api/blogs/${validNonexistantId}`)
      .set('Authorization', helper.createToken(user.username, user.id))
      .expect(204);
  });

  test('fails without token', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToDelete = blogsAtStart[0];
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401);

    const blogsAfter = await helper.blogsInDB();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length);
  });

  test('fails if user attempts to delete a post by someone else', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToDelete = blogsAtStart[0];
    const [creator, otherUser, ..._] = await helper.usersInDB();

    expect(blogToDelete.user.toString()).toEqual(creator.id);

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set(
        'Authorization',
        helper.createToken(otherUser.username, otherUser.id)
      )
      .expect(401);
  });
});

describe('updating part of a blog post', () => {
  test('blog posts likes can be updated with patch', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToUpdate = blogsAtStart[1];
    const updated = await api
      .patch(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 0 })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(updated.body.likes).toEqual(0);
  });

  test('likes cannot be set to value below 0', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToUpdate = blogsAtStart[1];
    await api
      .patch(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: -100 })
      .expect(400);
  });

  test('only provided fields change with patch update', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToUpdate = blogsAtStart[1];
    const newAuthor = 'Anonymous Author';
    const updated = await api
      .patch(`/api/blogs/${blogToUpdate.id}`)
      .send({ author: newAuthor })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(updated.body).toMatchObject({
      title: blogToUpdate.title,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes,
      author: newAuthor,
      user: blogToUpdate.user.toString(),
    });
  });

  test('fails with statuscode 404 if blog post does not exist', async () => {
    const validNonexistantId = await helper.nonExistingId();
    await api.patch(`/api/blogs/${validNonexistantId}`).expect(404);
  });

  test('fails with status code 400 if id is invalid', async () => {
    await api.patch('/api/blogs/totallyinvalidid').expect(400);
  });
});

describe('updating whole blog post', () => {
  const newBlogDetails = {
    author: 'Ryan Donovan',
    title: 'You should be reading academic computer science papers',
    url: 'https://stackoverflow.blog/2022/04/07/you-should-be-reading-academic-computer-science-papers/',
    likes: 303,
  };

  test('blog update with PUT succeeds if all fields (expect id) are present', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToUpdate = blogsAtStart[1];

    const updatedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlogDetails)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(updatedBlog.body.id);
    expect(updatedBlog.body).toEqual({
      id: blogToUpdate.id,
      user: blogToUpdate.user.toString(),
      ...newBlogDetails,
    });

    const blogsAfter = await helper.blogsInDB();
    const titles = blogsAfter.map((b) => b.title);
    expect(titles).toContain(newBlogDetails.title);
    expect(titles).not.toContain(blogToUpdate.title);
  });

  test('put request fails with code 400 if field is missing', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToUpdate = blogsAtStart[1];

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({
        author: 'Ryan Donovan',
        url: 'https://stackoverflow.blog/2022/04/07/you-should-be-reading-academic-computer-science-papers/',
        likes: 0,
      })
      .expect(400);

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({
        author: 'Some author',
        title: 'Some title',
        likes: 100,
      })
      .expect(400);

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({
        author: 'Some author',
        title: 'Some title',
        url: 'testing.com',
      })
      .expect(400);

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({
        title: 'One more new title',
        url: 'somegreatblog.com',
        likes: 3000,
      })
      .expect(400);

    const blogsAfter = await helper.blogsInDB();
    const blogAttemptedToUpdate = blogsAfter.find(
      (b) => b.id === blogToUpdate.id
    );
    expect(blogToUpdate).toEqual(blogAttemptedToUpdate);
  });

  test('put request for non-existant id fails with code 404', async () => {
    const validNonexistantId = await helper.nonExistingId();

    await api
      .put(`/api/blogs/${validNonexistantId}`)
      .send(newBlogDetails)
      .expect(404);
  });

  test('if id is invalid, put fails with code 400', async () => {
    await api
      .put('/api/blogs/totallyinvalidid')
      .send(newBlogDetails)
      .expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
