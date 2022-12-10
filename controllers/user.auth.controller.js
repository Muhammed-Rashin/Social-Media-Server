/* eslint-disable no-underscore-dangle */
const jwt = require("jsonwebtoken");
const userHelper = require("../database-helper/user-helper");

module.exports = {
  doSignup: async (req, res) => {
    let data = await userHelper.doSignup(req.body);
    if (data) {
      data = {
        email: data.email,
        username: data.username,
        _id: data._id,
      };
      const token = jwt.sign(data, process.env.JWT_SECRET_KEY, {
        expiresIn: 60 * 10,
      });
      res.cookie("Accesstoken", token, {
        sameSite: "Strict",
        expires: new Date("01 12 2023"),
        secure: true,
        path: "/",
        httpOnly: true,
      });
      res.json({ isAuth: true });
    } else {
      console.log("Signup failed");
    }
  },

  doLogin: async (req, res) => {
    let data = await userHelper.doLogin(req.body);

    if (data) {
      data = {
        email: data.email,
        username: data.username,
        _id: data._id,
      };
      const token = jwt.sign(data, process.env.JWT_SECRET_KEY, {
        expiresIn: 60 * 10,
      });
      res.cookie("Accesstoken", token, {
        sameSite: "Strict",
        expires: new Date("01 12 2023"),
        secure: true,
        path: "/",
        httpOnly: true,
      });
    } else {
      console.log("Signup failed");
    }
    res.json({ status: data });
  },
};
