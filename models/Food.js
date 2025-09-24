const mongoose = require('mongoose');
const { FOOD_CATEGORIES } = require('../config/environment');

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: FOOD_CATEGORIES, required: true },
  caloriesPer100g: { type: Number, required: true },
  compatibleDiets: { type: [String], enum: ['Mediterrânea', 'Low Carb', 'Cetogênica', 'Vegetariana'] },
  containsAllergens: { type: [String], enum: ['Lactose', 'Glúten', 'Proteína do leite', 'Ovo', 'Frutos do mar'] }
}, { timestamps: true });

module.exports = mongoose.model('Food', FoodSchema);