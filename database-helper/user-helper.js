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
    try {
      return await userModel.updateOne({ email: email }, { status: true });
    } catch (error) {
      console.log(error);
    }
  },

  resendEmail: async (email) => {
    try {
      return await userModel.findOne({ email: email });
    } catch (error) {
      console.log(error);
    }
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
    try {
      return await userModel.findOne({ email: email });
    } catch (error) {
      console.log(error);
    }
  },
  changePassword: async ({ email, password }) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return await userModel.updateOne(
        { email: email },
        { password: hashedPassword },
      );
    } catch (error) {
      console.log(error);
    }
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
    try {
      await postModel.deleteOne({ _id: id });
    } catch (error) {
      console.log(error);
    }
  },

  doLike: async (id, userId) => {
    try {
      const like = {
        date: Date.now(),
        userId,
      };
      const result = await postModel.updateOne(
        { _id: id },
        { $push: { likes: like } },
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  },

  doDisLIke: async (id, userId) => {
    try {
      await postModel.updateOne(
        { _id: id },
        {
          $pull: {
            likes: { userId },
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  },
  doComment: async (data) => {
    try {
      const commentSchema = new commentModel(data);
      const result = await commentSchema.save();
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  getComments: async (id) => {
    try {
      const result = await commentModel
        .find({ postId: id })
        .populate('userId')
        .populate('replys.userId');
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  likeComment: async (id, userId) => {
    try {
      const like = {
        date: Date.now(),
        userId,
      };
      const result = await commentModel.updateOne(
        { _id: id },
        { $push: { likes: like } },
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  disLikeComment: async (id, userId) => {
    try {
      await commentModel.updateOne(
        { _id: id },
        {
          $pull: {
            likes: { userId },
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  },
  replyComment: async ({ commentId, comment, userId }) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },
  getUserProfile: async (id) => {
    try {
      const user = await userModel.findOne({ _id: id });
      const posts = await postModel.find({ userId: id });
      return { user, posts };
    } catch (error) {
      console.log(error);
    }
  },
  editUserProfile: async (editData, id) => {
    try {
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
        const isExist = await userModel.findOne({
          username: editData.username,
        });

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
    } catch (error) {
      console.log(error);
    }
  },
  updateProfileImage: async (url, id) => {
    try {
      await userModel.updateOne({ _id: id }, { profileImg: url });
      const result = userModel.findOne({ _id: id });
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  searchUsers: async (search, id) => {
    try {
      const result = userModel
        .find({
          $and: [
            { _id: { $ne: id } },
            { username: { $regex: new RegExp('^' + search + '.*', 'i') } },
          ],
        })
        .exec();

      return result;
    } catch (error) {
      console.log(error);
    }
  },
  doFollow: async (id, userId) => {
    try {
      const data = {
        userId,
        date: Date.now(),
      };
      const result = await userModel.updateOne(
        { _id: id },
        { $push: { followers: data } },
      );
    } catch (error) {
      console.log(error);
    }
  },
  doUnfollow: async (id, userId) => {
    try {
      await userModel.updateOne(
        { _id: id },
        {
          $pull: {
            followers: { userId },
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  },
  getAllUsers: async (id) => {
    try {
      return await userModel.find({ _id: { $ne: id } });
    } catch (error) {
      console.log(error);
    }
  },

  sentMassage: async (data) => {
    try {
      const messageSchema = new messageModel(data);
      return await messageSchema.save();
    } catch (error) {
      console.log(error);
    }
  },
  getMessages: async (senterId, recieverId) => {
    try {
      const messages = await messageModel.find({
        $or: [
          { $and: [{ from: senterId }, { to: recieverId }] },
          { $and: [{ from: recieverId }, { to: senterId }] },
        ],
      });

      return messages;
    } catch (error) {
      console.log(error);
    }
  },
  getFollowers: async (id, callback) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },
};
