const mongoose = require('mongoose');

const AutoIncrement = require('mongoose-sequence')(mongoose);

const userModel = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    bio: String,
    profileImg: String,
    firstName: String,
    lastName: String,
    followers: Array,
    status: Boolean,
    // followers: [
    //   {
    //     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    //     date: Number,
    //   },
    // ],
  },
  { timestamps: true },
);

userModel.plugin(AutoIncrement, {
  index: 'order_seq',
  inc_field: 'index',
});
module.exports = mongoose.model('user', userModel);
