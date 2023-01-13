/* eslint-disable prefer-template */
/* eslint-disable no-else-return */
/* eslint-disable no-useless-catch */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
/* eslint-disable no-undef */
const bcrypt = require('bcrypt');
const userModel = require('../models/user-model');
const postModel = require('../models/post-model');
const commentModel = require('../models/comment-model');

module.exports = {
  doSignup: async (data) => {
    try {
      data.password = await bcrypt.hash(data.password, 10);
      const userSchema = new userModel(({ username, email, password } = data));
      return await userSchema.save();
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  doLogin: async (data) => {
    try {
      const userData = await userModel.findOne({ email: data.email });
      if (userData) {
        const match = await bcrypt.compare(data.password, userData.password);
        if (match) return userData;
      } else console.log('User not found');
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (postData) => {
    try {
      const postSchema = new postModel({ ...postData });
      return await postSchema.save();
    } catch (err) {
      throw err;
    }
  },
  getPosts: async () => {
    try {
      return await postModel.find().populate('userId');
    } catch (err) {
      throw err;
    }
  },
  deletePost: async ({ id }) => {
    await postModel.deleteOne({ _id: id });
  },

  doLike: async (id, userId) => {
    const like = {
      date: Date.now(),
      userId,
    };
    const result = await postModel.updateOne(
      { _id: id },
      { $push: { likes: like } },
    );
    return result;
  },

  doDisLIke: async (id, userId) => {
    await postModel.updateOne(
      { _id: id },
      {
        $pull: {
          likes: { userId },
        },
      },
    );
  },
  doComment: async (data) => {
    const commentSchema = new commentModel(data);
    const result = await commentSchema.save();
    return result;
  },
  getComments: async (id) => {
    const result = await commentModel
      .find({ postId: id })
      .populate('userId')
      .populate('replys.userId');
    return result;
  },
  likeComment: async (id, userId) => {
    const like = {
      date: Date.now(),
      userId,
    };
    const result = await commentModel.updateOne(
      { _id: id },
      { $push: { likes: like } },
    );
    return result;
  },
  disLikeComment: async (id, userId) => {
    await commentModel.updateOne(
      { _id: id },
      {
        $pull: {
          likes: { userId },
        },
      },
    );
  },
  replyComment: async ({ commentId, comment, userId }) => {
    const data = {
      comment,
      userId,
      date: Date.now(),
    };
    const result = await commentModel.updateOne(
      { _id: commentId },
      { $push: { replys: data } },
    );
    return result;
  },
  getUserProfile: async (id) => {
    const user = await userModel.findOne({ _id: id });
    const posts = await postModel.find({ userId: id });
    return { user: { ...user._doc }, posts };
  },
  editUserProfile: async (editData, id) => {
    if (editData.username === '') {
      await userModel.updateOne(
        { _id: id },
        {
          bio: editData.bio,
          firstName: editData.firstName,
          lastName: editData.lastName,
        },
      );
      const result = await userModel.findOne({ _id: id });
      return result;
    } else {
      const isExist = await userModel.findOne({ username: editData.username });

      if (isExist) return 'exist';

      await userModel.updateOne(
        { _id: id },
        {
          username: editData.username,
          bio: editData.bio,
          firstName: editData.firstName,
          lastName: editData.lastName,
        },
      );
      const result = await userModel.findOne({ _id: id });

      return result;
    }
  },
  updateProfileImage: async (url, id) => {
    await userModel.updateOne({ _id: id }, { profileImg: url });
    const result = userModel.findOne({ _id: id });
    return result;
  },
  searchUsers: async (search, id) => {
    const result = userModel
      .find({
        $and: [
          { _id: { $ne: id } },
          { username: { $regex: new RegExp('^' + search + '.*', 'i') } },
        ],
      })
      .exec();

    return result;
  },
  doFollow: async (id, userId) => {
    const data = {
      userId,
      date: Date.now(),
    };
    const result = await userModel.updateOne(
      { _id: id },
      { $push: { followers: data } },
    );
  },
  doUnfollow: async (id, userId) => {
    await userModel.updateOne(
      { _id: id },
      {
        $pull: {
          followers: { userId },
        },
      },
    );
  },
};
