/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const userHelper = require('../database-helper/user-helper');
const sentVerifyEmail = require('../utils/confirmEmail');

module.exports = {
  doSignup: async (req, res) => {
    const data = await userHelper.doSignup(req.body);

    if (data === 'emailExist') res.send('emailExist');
    else if (data === 'usernameExist') res.send('usernameExist');
    else if (data) {
      sentVerifyEmail(req.body);
      res.json({ status: true });
    } else {
      console.log('Signup failed');
    }
  },

  verifyEmail: (req, res) => {
    if (req.body.forgetToken) {
      const token = req.body.forgetToken;
      jwt.verify(
        token,
        process.env.JWT_EMAIL_VERIFICATION,
        async (err, decoded) => {
          if (err) {
            res.send(false);
          } else {
            res.send(decoded.email);
          }
        },
      );
    } else if (req.body.token) {
      const token = req.body.token;
      jwt.verify(
        token,
        process.env.JWT_EMAIL_VERIFICATION,
        async (err, decoded) => {
          if (err) {
            console.log(err);
            res.send(false);
          } else {
            if (await userHelper.verifyEmail(decoded.email)) {
              res.send(true);
            }
          }
        },
      );
    }
  },

  resendEmail: async (req, res) => {
    const data = await userHelper.resendEmail(req.body.email);
    if (data) {
      sentVerifyEmail(data);
      res.send(true);
    } else res.send(false);
  },

  doLogin: async (req, res) => {
    let data = await userHelper.doLogin(req.body);

    if (data === 'notConfirmed') {
      res.send('notConfirmed');
    } else if (data) {
      data = {
        email: data.email,
        username: data.username,
        _id: data._id,
      };
      const token = jwt.sign(data, process.env.JWT_SECRET_KEY, {
        expiresIn: 86400,
      });
      res.json({ Accesstoken: token, id: data._id });
    } else res.send(false);
  },

  forgetPassword: async (req, res) => {
    const result = await userHelper.forgetPassword(req.body.email);
    if (result) {
      sentVerifyEmail(result, 'forgetPassword');
      res.send(true);
    } else res.send('emailNotExist');
  },
  changePassword: async (req, res) => {
    const result = await userHelper.changePassword(req.body);
    if (result) {
      res.send(true);
    } else res.send(false);
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
  getAllUsers: async (req, res) => {
    const result = await userHelper.getAllUsers(req.userData._id);
    res.send(result);
  },
  sentMassage: async (req, res) => {
    const result = await userHelper.sentMassage({
      from: req.userData._id,
      ...req.body,
    });
    result ? res.send(true) : res.send(false);
  },
  getMessages: async (req, res) => {
    const result = await userHelper.getMessages(
      req.userData._id,
      req.body.recieverId,
    );

    result ? res.send(result) : res.send(false);
  },
  getFollowers: async (req, res) => {
    console.log(req.body.id);
    if (req.body.id) {
      await userHelper.getFollowers(req.body.id, (followers) => {
        console.log('Yes its here', followers);
        res.send(followers);
      });
    } else {
      await userHelper.getFollowers(req.userData._id, (followers) => {
        res.send(followers);
      });
    }
  },
  getFollowing: async (req, res) => {
    
  },
};
