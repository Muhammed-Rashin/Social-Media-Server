/* eslint-disable no-lonely-if */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
const jwt = require('jsonwebtoken');

// Middleware for verify user athorization
const verifyUser = (req, res, next) => {
  console.log(req.headers.token);
  if (req.headers.token) {
    const token = req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        res.json({ error: err.message });
      } else {
        req.userData = decoded;
        next();
      }
    });
  } else {
    res.json({ error: 'No Token Provided' });
  }
};

module.exports = verifyUser;
