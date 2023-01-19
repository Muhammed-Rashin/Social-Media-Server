/* eslint-disable arrow-body-style */
/* eslint-disable no-return-await */
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
const messageModel = require('../models/message-model');

module.exports = {
  doSignup: async (data) => {
    try {
      if (await userModel.findOne({ email: data.email })) return 'emailExist';
      if (await userModel.findOne({ username: data.username }))
        return 'usernameExist';

      data.password = await bcrypt.hash(data.password, 10);
      const userSchema = new userModel(({ username, email, password } = data));
      return await userSchema.save();
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  verifyEmail: async (email) => {
    return await userModel.updateOne({ email: email }, { status: true });
  },

  resendEmail: async (email) => {
    return await userModel.findOne({ email: email });
  },

  doLogin: async (data) => {
    try {
      const userData = await userModel.findOne({ email: data.email });
      if (userData) {
        const match = await bcrypt.compare(data.password, userData.password);
        if (match) {
          if (userData.status) {
            return userData;
          } else return 'notConfirmed';
        } else return false;
      } else return false;
    } catch (err) {
      console.log(err);
    }
  },

  forgetPassword: async (email) => {
    return await userModel.findOne({ email: email });
  },
  changePassword: async ({ email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await userModel.updateOne(
      { email: email },
      { password: hashedPassword },
    );
  },
  getUser: async (id) => {
    try {
      const data = await userModel.findOne({ _id: id }, { password: 0 });
      return data;
    } catch (error) {
      console.log(error);
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
  getAllUsers: async (id) => await userModel.find({ _id: { $ne: id } }),

  sentMassage: async (data) => {
    const messageSchema = new messageModel(data);
    return await messageSchema.save();
  },
  getMessages: async (senterId, recieverId) => {
    const messages = await messageModel.find({
      $or: [
        { $and: [{ from: senterId }, { to: recieverId }] },
        { $and: [{ from: recieverId }, { to: senterId }] },
      ],
    });

    return messages;
  },
  getFollowers: async (id, callback) => {
    const result = await userModel.findOne({ _id: id });
    let followers = [];
    if (result._doc.followers.length === 0) {
      callback([]);
    } else {
      result._doc.followers.forEach(async (element, index) => {
        let follower = await userModel.findOne({ _id: element.userId });

        if (follower) {
          if (follower.followers) {
            follower.followers.forEach((item, i) => {
              if (item.userId === id) {
                follower = {
                  ...follower._doc,
                  followed: true,
                };
              }
            });
          }
          followers.push(follower);
        }

        if (index + 1 == result.followers.length) {
          console.log(2);
          callback(followers);
        }
      });
    }
    // return details;
  },
};
