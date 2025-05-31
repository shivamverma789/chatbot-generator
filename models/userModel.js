// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String, // Only for email/password login
  googleId: String, // For Google sign-in
  githubId: String,
  bots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }],
});

module.exports = mongoose.model('User', userSchema);
