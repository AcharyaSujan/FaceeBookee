const mongoose = require('mongoose');

const textSchema = new mongoose.Schema({
  firstname:String,
  content: String
}
, {
  timestamps: true
}
);

const Text = mongoose.model('Text', textSchema);

module.exports = Text;