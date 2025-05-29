const express = require('express');
const router = express.Router();
const botController = require('../controllers/botController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Routes
router.get('/create-bot',isAuthenticated, botController.renderCreateBotForm);
router.post('/create-bot',isAuthenticated, botController.createBot);

router.get('/bot/:id',isAuthenticated, botController.showBotPreview);

router.post('/bot/:id/chat', botController.chatWithBot);
router.get('/bot/:id/chat',isAuthenticated, botController.renderChatPage);

router.get('/bot/:id/chat/embed', botController.renderEmbedChatPage);



router.post('/bot/:id/delete', isAuthenticated, botController.deleteBot);

router.get('/bot/:id/edit', isAuthenticated, botController.getEditBot);
router.post('/bot/:id/edit', isAuthenticated, botController.postEditBot);

router.get('/my-bots', isAuthenticated, botController.getMyBots);
router.get('/explore', isAuthenticated, botController.explorePublicBots);


module.exports = router;
