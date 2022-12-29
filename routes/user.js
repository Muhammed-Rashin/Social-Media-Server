const express = require('express');
const controller = require('../controllers/user.auth.controller');
const verifyAuth = require('../middlewares/verifyAuth');

const router = express.Router();

router.get('/', verifyAuth, () => {});

router.post('/signup', controller.doSignup);

router.post('/login', controller.doLogin);

router.post('/createPost', verifyAuth, controller.createPost);

router.post('/deletePost', verifyAuth, controller.deletePost);

router.get('/getPosts', verifyAuth, controller.getPosts);

module.exports = router;
