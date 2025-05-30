const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send('Email already exists.');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    return res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Registration Error');
  }
};

exports.loginUser = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
});

exports.logoutUser = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};

// exports.googleCallback = passport.authenticate('google', {
//   successRedirect: '/dashboard',
//   failureRedirect: '/auth/login',
// });
