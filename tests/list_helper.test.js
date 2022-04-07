const { expect } = require('@jest/globals');
const listHelper = require('../utils/list_helper');

test('dummy returns one', () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0,
    },
  ];

  const listWithMultipleBlogs = [
    {
      _id: '624eb173cbc394158e5dd221',
      title: 'Sample Blog Post',
      author: 'Test Blogger',
      url: 'www.blog.test.com/sample-blog',
      likes: 1,
      __v: 0,
    },
    {
      _id: '624eb1b7cbc394158e5dd224',
      title: 'Best Blog Post',
      author: 'Best Blogger',
      url: 'www.bestblog.com/best-post-ever',
      likes: 10,
      __v: 0,
    },
    {
      _id: '624eb3c848e06ea986ff858a',
      title: 'Wors Blog Post',
      author: 'Wors Blogger',
      url: 'www.worstblog.com/this-is-the-worst',
      likes: 55,
      __v: 0,
    },
    {
      _id: '624eb3d748e06ea986ff858c',
      title: 'Worst Blog Post',
      author: 'Worst Blogger',
      url: 'www.worstblog.com/this-is-the-worst',
      likes: 0,
      __v: 0,
    },
    {
      _id: '624eb6517442dbd306e92837',
      title: 'Some post',
      author: 'Some Blogger',
      url: 'www.someblog.com/just-a-random-post',
      likes: 4,
      __v: 0,
    },
  ];

  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0);
  });

  test('when list has only one blog equals the likes of that', () => {
    expect(listHelper.totalLikes(listWithOneBlog)).toBe(5);
  });

  test('of a bigger list is calculated right', () => {
    expect(listHelper.totalLikes(listWithMultipleBlogs)).toBe(70);
  });
});
