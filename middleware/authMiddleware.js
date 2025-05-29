function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login'); //should also notify that login first (pending)
}

module.exports = { isAuthenticated };
