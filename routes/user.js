const express = require("express");
const controller = require("../controllers/user.auth.controller");
const verifyAuth = require("../middlewares/verifyAuth");

const router = express.Router();

router.get("/", verifyAuth, () => {});

router.post("/signup", controller.doSignup);

router.post("/login", controller.doLogin);

module.exports = router;
