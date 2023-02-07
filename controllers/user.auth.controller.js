/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const userHelper = require('../database-helper/user-helper');
const sentVerifyEmail = require('../utils/confirmEmail');

module.exports = {
  test: (req, res) => {
    res.send('Server Is Running');
  },
  doSignup: async (req, res) => {
    try {
      const data = await userHelper.doSignup(req.body);

      if (data === 'emailExist') res.send('emailExist');
      else if (data === 'usernameExist') res.send('usernameExist');
      else if (data) {
        sentVerifyEmail(req.body);
        res.json({ status: true });
      } else {
        console.log('Signup failed');
      }
    } catch (error) {
      console.log(error);
    }
  },

  verifyEmail: (req, res) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },

  resendEmail: async (req, res) => {
    try {
      const data = await userHelper.resendEmail(req.body.email);
      if (data) {
        sentVerifyEmail(data);
        res.send(true);
      } else res.send(false);
    } catch (error) {
      console.log(error);
    }
  },

  doLogin: async (req, res) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },

  forgetPassword: async (req, res) => {
    try {
      const result = await userHelper.forgetPassword(req.body.email);
      if (result) {
        sentVerifyEmail(result, 'forgetPassword');
        res.send(true);
      } else res.send('emailNotExist');
    } catch (error) {
      console.log(error);
    }
  },
  changePassword: async (req, res) => {
    try {
      const result = await userHelper.changePassword(req.body);
      if (result) {
        res.send(true);
      } else res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  createPost: (req, res) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },
  getPosts: async (req, res) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },
  deletePost: async (req, res) => {
    try {
      await userHelper.deletePost(req.body);
      res.send('success');
    } catch (error) {
      console.log(error);
    }
  },
  doLIke: async (req, res) => {
    try {
      const result = await userHelper.doLike(req.body.id, req.userData._id);
      result ? res.send(true) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },

  doDisLIke: async (req, res) => {
    try {
      const result = await userHelper.doDisLIke(req.body.id, req.userData._id);
      result ? res.send(true) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  doComment: async (req, res) => {
    try {
      const result = await userHelper.doComment({
        postId: req.body.id,
        comment: req.body.comment,
        userId: req.userData._id,
      });
      result ? res.send(true) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  getComments: async (req, res) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },
  likeComment: async (req, res) => {
    try {
      const result = await userHelper.likeComment(
        req.body.id,
        req.userData._id,
      );
      result ? res.send(true) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  disLikeComment: async (req, res) => {
    try {
      const result = await userHelper.disLikeComment(
        req.body.id,
        req.userData._id,
      );
      result ? res.send(true) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  replyComment: async (req, res) => {
    try {
      const result = await userHelper.replyComment({
        commentId: req.body.id,
        comment: req.body.comment,
        userId: req.userData._id,
      });
      result ? res.send(true) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  getUserProfile: async (req, res) => {
    try {
      let result;
      if (req.body.id) {
        result = await userHelper.getUserProfile(req.body.id);
        if (result.user.followers) {
          console.log('hello' + result.user.followers);
          result.user.followers.forEach((follower) => {
            if (follower.userId === req.userData._id) {
              result.user = { ...result.user._doc, followed: true };
            }
          });
        }
      } else {
        result = await userHelper.getUserProfile(req.userData._id);
      }
      result
        ? res.json({ user: result.user, posts: result.posts })
        : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  editUserProfile: async (req, res) => {
    try {
      const result = await userHelper.editUserProfile(
        req.body,
        req.userData._id,
      );
      if (result === 'exist') res.send('exist');
      else res.send(result);
    } catch (error) {
      console.log(error);
    }
  },
  updateProfileImage: async (req, res) => {
    try {
      cloudinary(req.body.profileImage).then(async (url) => {
        const result = await userHelper.updateProfileImage(
          url,
          req.userData._id,
        );
        res.send(result);
      });
    } catch (error) {
      console.log(error);
    }
  },
  searchUsers: async (req, res) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },
  doFollow: async (req, res) => {
    try {
      const result = await userHelper.doFollow(req.body.id, req.userData._id);
      result ? res.send(true) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  doUnfollow: async (req, res) => {
    try {
      const result = await userHelper.doUnfollow(req.body.id, req.userData._id);
      result ? res.send(true) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  getAllUsers: async (req, res) => {
    try {
      console.log('peri peri peri');
      const result = await userHelper.getAllUsers(req.userData._id);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  },
  sentMassage: async (req, res) => {
    try {
      const result = await userHelper.sentMassage({
        from: req.userData._id,
        ...req.body,
      });
      result ? res.send(true) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  getMessages: async (req, res) => {
    try {
      const result = await userHelper.getMessages(
        req.userData._id,
        req.body.recieverId,
      );

      result ? res.send(result) : res.send(false);
    } catch (error) {
      console.log(error);
    }
  },
  getFollowers: async (req, res) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  },
  getFollowing: async (req, res) => {},
};
