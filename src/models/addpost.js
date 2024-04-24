const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  firstname:String,
  content: String,
  image:String
  
}
, {
  timestamps: true
}
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;