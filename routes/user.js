/* eslint-disable no-underscore-dangle */
const express = require('express');
const controller = require('../controllers/user.auth.controller');
const userHelper = require('../database-helper/user-helper');
const verifyAuth = require('../middlewares/verifyAuth');

const router = express.Router();

router.get('/', verifyAuth, () => {});

router.post('/signup', controller.doSignup);

router.post('/login', controller.doLogin);

router.get('/getUser', verifyAuth, async (req, res) => {
  const result = await userHelper.getUser(req.userData._id);
  res.send(result);
});

router.post('/createPost', verifyAuth, controller.createPost);

router.get('/getPosts', verifyAuth, controller.getPosts);

router.post('/deletePost', verifyAuth, controller.deletePost);

router.post('/likePost', verifyAuth, controller.doLIke);

router.post('/dislikePost', verifyAuth, controller.doDisLIke);

router.post('/commentPost', verifyAuth, controller.doComment);

router.post('/replyComment', verifyAuth, controller.replyComment);

router.post('/likeComment', verifyAuth, controller.likeComment);

router.post('/getComments', verifyAuth, controller.getComments);

router.post('/disLikeComment', verifyAuth, controller.disLikeComment);

router.post('/getUserProfile', verifyAuth, controller.getUserProfile);

router.post('/editUserProfile', verifyAuth, controller.editUserProfile);

router.post('/updateProfileImage', verifyAuth, controller.updateProfileImage);

router.post('/searchUsers', verifyAuth, controller.searchUsers);

router.post('/doFollow', verifyAuth, controller.doFollow);

router.post('/doUnfollow', verifyAuth, controller.doUnfollow);

router.get('/getAllUsers', verifyAuth, controller.getAllUsers);

router.post('/sentMassage', verifyAuth, controller.sentMassage);

router.post('/getMessages', verifyAuth, controller.getMessages);

module.exports = router;
