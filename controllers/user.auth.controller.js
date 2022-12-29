/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const userHelper = require('../database-helper/user-helper');

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
      res.cookie('Accesstoken', token, {
        sameSite: 'Strict',
        expires: new Date('01 12 2023'),
        secure: true,
        path: '/',
        httpOnly: true,
      });
      res.json({ isAuth: true });
    } else {
      console.log('Signup failed');
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
      res.cookie('Accesstoken', token, {
        sameSite: 'Strict',
        expires: new Date('01 12 2023'),
        secure: true,
        path: '/',
        httpOnly: true,
      });
    } else {
      console.log('Password incorrect');
    }
    res.json({ status: data });
  },
  createPost: (req, res) => {
    cloudinary(req.body.image)
      .then(async (url) => {
        const postData = {
          ...req.body,
          imageUrl: url,
          userId: req.userData._id,
        };
        await userHelper.createPost(postData);
        res.send('Success');
      })
      .catch((err) => res.status(509).send(err));
  },
  getPosts: async (req, res) => {
    const posts = await userHelper.getPosts();
    console.log(posts);
    res.json({ posts });
  },
  deletePost: async (req, res) => {
    console.log(req.body);
    await userHelper.deletePost(req.body);
    res.send('success');
  },
};
