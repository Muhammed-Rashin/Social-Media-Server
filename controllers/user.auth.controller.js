/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
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
        expiresIn: 60 * 60 * 60 * 24,
      });
      res.cookie('Accesstoken', token, {
        sameSite: 'Strict',
        expires: false,
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

    posts.forEach((element, index) => {
      if (element.likes) {
        element.likes.forEach((like) => {
          if (like.userId === req.userData._id) {
            posts[index] = {
              ...element._doc,
              liked: true,
            };
          }
        });
      }
    });

    res.json({ posts, reqUserId: req.userData._id });
  },
  deletePost: async (req, res) => {
    await userHelper.deletePost(req.body);
    res.send('success');
  },
  doLIke: async (req, res) => {
    const result = await userHelper.doLike(req.body.id, req.userData._id);
    result ? res.send(true) : res.send(false);
  },

  doDisLIke: async (req, res) => {
    const result = await userHelper.doDisLIke(req.body.id, req.userData._id);
    result ? res.send(true) : res.send(false);
  },
  doComment: async (req, res) => {
    const result = await userHelper.doComment({
      postId: req.body.id,
      comment: req.body.comment,
      userId: req.userData._id,
    });
    result ? res.send(true) : res.send(false);
  },
  getComments: async (req, res) => {
    const comments = await userHelper.getComments(req.body.id);

    comments.forEach((element, index) => {
      if (element.likes) {
        element.likes.forEach((like) => {
          if (like.userId === req.userData._id) {
            comments[index] = {
              ...element._doc,
              liked: true,
            };
          }
        });
      }
    });

    comments ? res.send(comments) : res.send(false);
  },
  likeComment: async (req, res) => {
    const result = await userHelper.likeComment(req.body.id, req.userData._id);
    result ? res.send(true) : res.send(false);
  },
  disLikeComment: async (req, res) => {
    const result = await userHelper.disLikeComment(
      req.body.id,
      req.userData._id,
    );
    result ? res.send(true) : res.send(false);
  },
  replyComment: async (req, res) => {
    const result = await userHelper.replyComment({
      commentId: req.body.id,
      comment: req.body.comment,
      userId: req.userData._id,
    });
    result ? res.send(true) : res.send(false);
  },
  getUserProfile: async (req, res) => {
    let result;
    if (req.body.id) {
      result = await userHelper.getUserProfile(req.body.id);
      if (result.user.followers) {
        console.log(result.user.followers);
        result.user.followers.forEach((follower) => {
          if (follower.userId === req.userData._id) {
            result.user.followed = true;
          }
        });
      }
    } else {
      result = await userHelper.getUserProfile(req.userData._id);
    }

    result
      ? res.json({ user: result.user, posts: result.posts })
      : res.send(false);
  },
  editUserProfile: async (req, res) => {
    const result = await userHelper.editUserProfile(req.body, req.userData._id);
    if (result === 'exist') res.send('exist');
    else res.send(result);
  },
  updateProfileImage: async (req, res) => {
    cloudinary(req.body.profileImage).then(async (url) => {
      const result = await userHelper.updateProfileImage(url, req.userData._id);
      res.send(result);
    });
  },
  searchUsers: async (req, res) => {
    const result = await userHelper.searchUsers(
      req.body.searchValue,
      req.userData._id,
    );
    if (result.length != 0) {
      result.forEach((element, index) => {
        if (element.followers) {
          element.followers.forEach((follower) => {
            if (follower.userId === req.userData._id) {
              result[index] = {
                ...element._doc,
                followed: true,
              };
            }
          });
        }
      });
    }

    result.length === 0 ? res.send('nothing') : res.send(result);
  },
  doFollow: async (req, res) => {
    const result = await userHelper.doFollow(req.body.id, req.userData._id);
    result ? res.send(true) : res.send(false);
  },
  doUnfollow: async (req, res) => {
    const result = await userHelper.doUnfollow(req.body.id, req.userData._id);
    result ? res.send(true) : res.send(false);
  },
};
