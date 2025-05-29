const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  name: String,
  type: String,
  tone: String,
  abilities: String,
  goal: String,
  systemPrompt: String,
  description: { type: String, default: '' },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
});

module.exports = mongoose.model('Bot', botSchema);
