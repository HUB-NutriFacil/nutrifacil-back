const Recommendation = require('../models/Recommendation');
const AIService = require('./aiService');
const CalculationService = require('./calculationService');
const logger = require('../config/logger');

class RecommendationService {
  async generateRecommendation(userId, userData) {
    try {
      // 1. Cálculos básicos
      const tmb = CalculationService.calculateTMB(userData);
      const waterIntake = CalculationService.calculateWaterIntake(userData);
      
      // 2. Gerar plano com IA
      const aiPlan = await AIService.generateDietPlan({
        ...userData,
        calculatedCalories: tmb
      });

      // 3. Criar e salvar recomendação
      const recommendation = new Recommendation({
        userId,
        dietType: userData.dietType,
        dailyCalories: aiPlan.dailyCalories || tmb,
        waterIntake: aiPlan.hydration?.waterIntake || waterIntake,
        macronutrients: aiPlan.macronutrients,
        meals: this._formatMeals(aiPlan.meals),
        nutritionalTips: aiPlan.nutritionalTips,
        aiGenerated: true,
        metadata: {
          model: AIService.model,
          promptVersion: '1.0'
        }
      });

      await recommendation.save();
      return recommendation;

    } catch (error) {
      logger.error('Recommendation generation failed:', error);
      throw error;
    }
  }

  _formatMeals(meals) {
    return meals.map(meal => ({
      mealType: meal.type,
      foods: meal.foods.map(food => ({
        name: food.name,
        category: food.category,
        quantity: food.quantity,
        calories: food.calories,
        notes: food.notes
      }))
    }));
  }

  async getUserRecommendations(userId) {
    return Recommendation.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }
}

module.exports = new RecommendationService();