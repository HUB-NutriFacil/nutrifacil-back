const RecommendationService = require('../services/recommendationService');
const { validateUserInput } = require('../utils/validators');
const logger = require('../config/logger');

exports.generateAIRecommendation = async (req, res) => {
  try {
    // 1. Validação
    const errors = validateUserInput(req.body);
    if (errors) {
      return res.status(400).json({ 
        success: false, 
        errors 
      });
    }

    // 2. Gerar recomendação
    const recommendation = await RecommendationService.generateRecommendation(
      req.user?.id || null, 
      req.body
    );

    // 3. Formatar resposta
    res.json({
      success: true,
      data: {
        recommendationId: recommendation._id,
        dietType: recommendation.dietType,
        dailyCalories: recommendation.dailyCalories,
        waterIntake: recommendation.waterIntake,
        meals: recommendation.meals,
        tips: recommendation.nutritionalTips,
        generatedAt: recommendation.createdAt
      }
    });

  } catch (error) {
    logger.error('Error in generateAIRecommendation:', error);
    
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Erro ao gerar recomendação',
      details: process.env.NODE_ENV === 'development' ? error.details : undefined
    });
  }
};

exports.getUserRecommendations = async (req, res) => {
  try {
    const recommendations = await RecommendationService.getUserRecommendations(
      req.params.userId
    );
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar recomendações'
    });
  }
};