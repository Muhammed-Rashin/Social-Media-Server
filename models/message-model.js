const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const userModel = require('./user-model');

const messageModel = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
    },
    message: String,
  },
  { timestamps: true },
);

messageModel.plugin(AutoIncrement, {
  index: 'message_count',
  inc_field: 'messageId',
});
module.exports = mongoose.model('message', messageModel);
