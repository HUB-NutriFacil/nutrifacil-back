const express = require('express');
const router = express.Router();
const DietController = require('../controllers/dietController');
const rateLimit = require('express-rate-limit');
const config = require('../config/environment');

// Rate limiting para evitar abuso da API de IA
const aiLimiter = rateLimit({
  windowMs: config.limits.apiRateLimit.windowMs,
  max: config.limits.apiRateLimit.max,
  message: {
    success: false,
    error: 'Muitas requisições. Por favor, tente novamente mais tarde.'
  }
});

// Rota para geração de recomendações com IA
router.post('/ai-recommendations', aiLimiter, DietController.generateAIRecommendation);

// Rota para histórico de recomendações
router.get('/user/:userId/recommendations', DietController.getUserRecommendations);

module.exports = router;