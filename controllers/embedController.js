const Bot = require('../models/botModel');

exports.serveEmbedScript = async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.botId);
    if (!bot || bot.visibility === 'private') {
      res.set('Content-Type', 'application/javascript');
      return res.send('// Bot not found or private');
    }

    res.set('Content-Type', 'application/javascript');
    res.render('embedScript', { bot });
  } catch (error) {
    console.error("Embed script error:", error);
    res.status(500).send('// Internal server error');
  }
};
