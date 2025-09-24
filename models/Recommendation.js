const mongoose = require('mongoose');
const { DIET_TYPES, MEAL_TYPES, FOOD_CATEGORIES } = require('../utils/constants');

const FoodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: FOOD_CATEGORIES, required: true },
  quantity: { type: String, required: true },
  calories: { type: Number, required: true },
  notes: { type: String }
});

const MealSchema = new mongoose.Schema({
  mealType: { type: String, enum: MEAL_TYPES, required: true },
  foods: [FoodItemSchema]
});

const MacronutrientSchema = new mongoose.Schema({
  grams: { type: Number, required: true },
  percentage: { type: Number, required: true }
});

const RecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dietType: { type: String, enum: DIET_TYPES, required: true },
  dailyCalories: { type: Number, required: true },
  waterIntake: { type: Number, required: true },
  macronutrients: {
    protein: MacronutrientSchema,
    carbs: MacronutrientSchema,
    fats: MacronutrientSchema
  },
  meals: [MealSchema],
  nutritionalTips: { type: String },
  aiGenerated: { type: Boolean, default: false },
  metadata: {
    model: { type: String },
    promptVersion: { type: String },
    apiUsed: { type: String, default: 'openai' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', RecommendationSchema);