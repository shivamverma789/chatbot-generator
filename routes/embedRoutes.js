const express = require('express');
const router = express.Router();
const embedController = require('../controllers/embedController');

router.get('/embed/:botId', embedController.serveEmbedScript);

module.exports = router;
