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

  const favorite = blogs.reduce((prev, curr) =>
    prev.likes > curr.likes ? prev : curr
  );

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
};

module.exports = {
  dummy,
  favoriteBlog,
  totalLikes,
};
