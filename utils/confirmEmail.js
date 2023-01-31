const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const sentVerifyEmail = ({ email, username }, type) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pradaxofficial@gmail.com',
      pass: process.env.EMAIL_APP_PASS,
    },
  });

  const token = jwt.sign(
    {
      email,
    },
    process.env.JWT_EMAIL_VERIFICATION,
    { expiresIn: '10m' },
  );
  let mailConfigurations;
  if (type === 'forgetPassword') {
    mailConfigurations = {
      // It should be a string of sender/server email
      from: 'pradaxofficial@gmail.com',

      to: email,

      // Subject of Email
      subject: 'Email Verification For Forget Password',

      // This would be the text of email body
      text: `Hi! ${username}, You have recently visited 
      our website and entered your email.
      Please follow the given link to verify your email
      ${process.env.SITE_URL}/verifyForgetPassword/?token=${token}
      This Link only valid for 10 Minuts
      Thanks`,
    };
  } else {
    mailConfigurations = {
      // It should be a string of sender/server email
      from: 'pradaxofficial@gmail.com',

      to: email,

      // Subject of Email
      subject: 'Email Verification For Pradax Social  System',

      // This would be the text of email body
      text: `Hi! ${username}, You have recently visited 
      our website and entered your email.
      Please follow the given link to verify your email
      ${process.env.SITE_URL}/verifyEmail/?token=${token}
      This Link only valid for 10 Minuts
      Thanks`,
    };
  }

  transporter.sendMail(mailConfigurations, (error, info) => {
    if (error) throw Error(error);
    else console.log('Email Sent Successfully');
  });
};

module.exports = sentVerifyEmail;
