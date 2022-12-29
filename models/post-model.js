const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const userModel = require('./user-model');

const postModel = new mongoose.Schema(
  {
    imageUrl: String,
    caption: String,
    location: String,
    status: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userModel,
    },
  },
  { timestamps: true },
);

postModel.plugin(AutoIncrement, {
  index: 'post_count',
  inc_field: 'id',
});
module.exports = mongoose.model('post', postModel);
