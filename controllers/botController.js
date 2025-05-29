const Bot = require('../models/botModel');
const User = require('../models/userModel');
const generateSystemPrompt = require('../utils/promptGenerator');
const { getGeminiReply,generateBotDescription} = require('../utils/gemini');
// const { generateDescription } = require('../utils/gemini');

// GET /create-bot
exports.renderCreateBotForm = (req, res) => {
    res.render('createBot');
};

// POST /create-bot
exports.createBot = async (req, res) => {
  const { name, type, tone, abilities, goal, visibility } = req.body;

  try {
    const newBot = new Bot({ name, type, tone, abilities, goal, visibility, admin: req.user._id });

    newBot.systemPrompt = generateSystemPrompt(newBot);

    // Generate description via Gemini AI
    newBot.description = await generateBotDescription(newBot);

    await newBot.save();

    // Add bot id to user's bots array
    req.user.bots.push(newBot._id);
    await req.user.save();

    res.redirect(`/bot/${newBot._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while saving your bot.");
  }
};

// GET /bot/:id
exports.showBotPreview = async (req, res) => {
    try {
        const bot = await Bot.findById(req.params.id);
        if (!bot) return res.status(404).send("Bot not found.");
        res.render('botPreview', { bot });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading bot preview.");
    }
};

async function callGeminiAPI(prompt) {
  // Replace this with real Gemini API integration
  return `Gemini response to: "${prompt}"`;
}

exports.chatWithBot = async (req, res) => {
  const { message } = req.body;
  const botId = req.params.id;

  try {
    const bot = await Bot.findById(botId);
    if (!bot) return res.status(404).json({ error: "Bot not found." });

    const reply = await getGeminiReply(bot, message);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error during chat." });
  }
};

exports.deleteBot = async (req, res) => {
  try {
    const botId = req.params.id;
    const userId = req.user._id;

    // Find bot by id
    const bot = await Bot.findById(botId);

    if (!bot) {
      return res.status(404).send("Bot not found");
    }

    // Check if logged in user is the admin of the bot
    if (bot.admin.toString() !== userId.toString()) {
      return res.status(403).send("You are not authorized to delete this bot");
    }

    // Delete the bot
    await Bot.findByIdAndDelete(botId);

    // Remove bot id from user's bots array
    await User.findByIdAndUpdate(userId, { $pull: { bots: botId } });

    // Redirect back to user's bots list page
    res.redirect('/my-bots');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting the bot");
  }
};


exports.renderChatPage = async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.id);
    if (!bot) return res.status(404).send("Bot not found.");
    res.render('botChat', { bot, messages: [] }); // if you're using in-memory messages
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading chat.");
  }
};

exports.renderEmbedChatPage = async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.id);
    if (!bot) return res.status(404).send("Bot not found.");
    res.render('embedChat', { bot, messages: [] }); // if you're using in-memory messages
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading chat.");
  }
};

exports.getMyBots = async (req, res) => {
  try {
    // Find all bots where admin is current user
    const bots = await Bot.find({ admin: req.user._id });

    // Render view with bots list
    res.render('myBots', { user: req.user, bots });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load your bots');
  }
};

//explore bots 
exports.explorePublicBots = async (req, res) => {
  try {
    const publicBots = await Bot.find({ visibility: 'public' }).populate('admin', 'name');
    res.render('explore', { bots: publicBots });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching public bots.");
  }
};

// Show edit form with current bot data
exports.getEditBot = async (req, res) => {
  try {
    const botId = req.params.id;
    const userId = req.user._id;

    const bot = await Bot.findById(botId);
    if (!bot) return res.status(404).send("Bot not found");

    if (bot.admin.toString() !== userId.toString()) {
      return res.status(403).send("Unauthorized");
    }

    res.render('edit-bot', { bot });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit form");
  }
};

// Handle edited bot data submission
exports.postEditBot = async (req, res) => {
  try {
    const botId = req.params.id;
    const userId = req.user._id;
    const { name, type, tone, abilities, goal, visibility } = req.body;

    const bot = await Bot.findById(botId);
    if (!bot) return res.status(404).send("Bot not found");
    if (bot.admin.toString() !== userId.toString()) return res.status(403).send("Unauthorized");

    bot.name = name;
    bot.type = type;
    bot.tone = tone;
    bot.abilities = abilities;
    bot.goal = goal;
    bot.visibility = visibility;

    bot.systemPrompt = generateSystemPrompt(bot);

    // Regenerate description when bot is edited
    bot.description = await generateBotDescription(bot);

    await bot.save();

    res.redirect(`/bot/${botId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating bot");
  }
};
