/* eslint-disable no-lonely-if */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
const jwt = require("jsonwebtoken");

// Middleware for verify user athorization
const verifyUser = (req, res, next) => {
  if (req.cookies.Accesstoken) {
    const token = req.cookies.Accesstoken;
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        res.json({ error: err.message });
      } else {
        next();
      }
    });
  } else {
    res.json({ error: "No Token Provided" });
  }
};

module.exports = verifyUser;
