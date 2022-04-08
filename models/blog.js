const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title of blog post missing'],
  },
  author: {
    type: String,
    required: [true, "Author's name missing"],
  },
  url: {
    type: String,
    required: [true, 'Blog post url is missing'],
  },
  likes: {
    type: Number,
    min: 0,
    required: false,
  },
});

blogSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Blog', blogSchema);
