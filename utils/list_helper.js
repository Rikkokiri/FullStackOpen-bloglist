const _ = require('lodash');

/** Define a dummy function that receives an array of blog posts as a parameter
 * and always returns the value 1.
 */
const dummy = (blogs) => {
  // ...
  return 1;
};

/**
 * The function returns the total sum of likes in all of the blog posts in provided list.
 */
const totalLikes = (blogs) => {
  return blogs.reduce((sum, curr) => sum + curr.likes, 0);
};

/**
 * Define a new favoriteBlog function that receives a list of blogs as a parameter.
 * The function finds out which blog has most likes. If there are many top favorites,
 * it is enough to return one of them.
 */
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return undefined;
  return _.chain(blogs)
    .reduce((prev, curr) => (prev.likes >= curr.likes ? prev : curr))
    .pick(['title', 'author', 'likes'])
    .value();
};

/**
 * Define a function called mostBlogs that receives an array of blogs as a parameter.
 * The function returns the author who has the largest amount of blogs.
 * The return value also contains the number of blogs the top author has:
 * {
 *  author: "...",
 *  blogs: {number of blogs}
 * }
 *
 * Result for empty list will be undefined.
 */
const mostBlogs = (blogs) => {
  if (blogs.length === 0) return undefined;

  return _.chain(blogs)
    .countBy('author')
    .transform((result, value, key) => {
      result.push({ author: key, blogs: value });
    }, [])
    .maxBy('blogs')
    .value();
};

/**
 * Returns the author, whose blog posts have the largest amount of likes.
 * The return value also contains the total number of likes that the author has received:
 * {
 *  author: "...",
 *  likes: { sum of likes }
 * }
 *
 * Result for empty list will be undefined.
 */
const mostLikes = (blogs) => {
  if (blogs.length === 0) return undefined;
  return _.chain(blogs)
    .groupBy('author')
    .transform((result, blogsByAuthor, author) => {
      result.push({
        author: author,
        likes: _.sumBy(blogsByAuthor, 'likes'),
      });
    }, [])
    .maxBy('likes')
    .value();
};

module.exports = {
  dummy,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  totalLikes,
};
