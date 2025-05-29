const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Passport config
require('./utils/passportConfig')(passport); // Initialize local strategy

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'yourSecret',
    resave: false,
    saveUninitialized: false
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated?.(); // `true` if logged in
  res.locals.user = req.user || null; // You can use user details in views
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const indexRoutes = require('./routes/index');
const botRoutes = require('./routes/botRoutes');
const authRoutes = require('./routes/authRoutes');
const embedRoutes = require('./routes/embedRoutes');

app.use('/', indexRoutes);
app.use('/', botRoutes);         // Use /bots to avoid path conflicts
app.use('/auth', authRoutes);        // Login, register, etc.
app.use('/', embedRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
