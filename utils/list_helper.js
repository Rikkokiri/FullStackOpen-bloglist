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

module.exports = {
  dummy,
  totalLikes,
};
