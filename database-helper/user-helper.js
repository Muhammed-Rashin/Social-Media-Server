/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
/* eslint-disable no-undef */
const bcrypt = require("bcrypt");
const userModel = require("../models/user-model");

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
      }
    } catch (err) {
      console.log(err);
    }
  },
};
