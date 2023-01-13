const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const postModel = require('./post-model');
const userModel = require('./user-model');

const commentModel = new mongoose.Schema(
  {
    comment: String,
    replys: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: userModel },
        comment: String,
        date: Number,
      },
    ],
    likes: Array,
    userId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: userModel,
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: postModel,
    },
  },
  { timestamps: true },
);

commentModel.plugin(AutoIncrement, {
  index: 'comment_count',
  inc_field: 'commentId',
});
module.exports = mongoose.model('comment', commentModel);
