/* eslint-disable no-useless-catch */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
/* eslint-disable no-undef */
const bcrypt = require('bcrypt');
const userModel = require('../models/user-model');
const postModel = require('../models/post-model');

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
};
