const Diet = require('../models/Diet');
const Food = require('../models/Food');
const { DIET_TYPES } = require('../utils/constants');

class DietService {
  static async getDietByType(type) {
    if (!DIET_TYPES.includes(type)) {
      throw new Error('Tipo de dieta inválido');
    }
    
    const diet = await Diet.findOne({ type });
    if (!diet) {
      throw new Error('Dieta não encontrada');
    }
    
    return diet;
  }

  static async getCompatibleFoods(dietType, category) {
    return Food.find({
      category,
      compatibleDiets: dietType
    });
  }

  static async generateMealPlan(dietType, userData) {
    const diet = await this.getDietByType(dietType);
    const mealPlan = {
      breakfast: await this.generateMeal('proteins', dietType),
      lunch: await this.generateMeal('vegetables', dietType),
      dinner: await this.generateMeal('greens', dietType),
      snacks: await this.generateMeal('carbs', dietType)
    };
    
    return {
      dietInfo: diet,
      mealPlan
    };
  }

  static async generateMeal(category, dietType) {
    const foods = await this.getCompatibleFoods(dietType, category);
    if (foods.length === 0) return null;
    
    return {
      category,
      items: foods.map(food => ({
        name: food.name,
        quantity: '100g',
        calories: food.caloriesPer100g
      }))
    };
  }
}

module.exports = DietService;