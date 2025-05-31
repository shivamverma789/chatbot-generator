const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const bcrypt = require('bcrypt');
const User = require('../models/userModel');

module.exports = function (passport) {
  passport.serializeUser(async(user, done) => done(null, user.id));
  passport.deserializeUser(async(id, done) => {
     try {
    const user = await User.findById(id); // No callback
    done(null, user);
  } catch (err) {
    done(err, null);
  }
  });

  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'No user found' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.use(new GoogleStrategy({
    
    callbackURL: '/auth/google/callback'
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));

    passport.use(new GitHubStrategy({
    
    callbackURL: `${process.env.BASE_URL}/auth/github/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails && profile.emails[0]?.value;
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.create({
        githubId: profile.id,
        name: profile.displayName,
        email: email || 'Not provided',
      });
    }
    return done(null, user);
  }
));
};
