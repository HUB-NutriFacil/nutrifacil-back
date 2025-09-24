const mongoose = require('mongoose');
const { DIET_TYPES } = require('../config/environment');

const DietSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: DIET_TYPES,
    required: true,
    unique: true
  },
  description: { type: String, required: true },
  recommendedFoods: {
    proteins: [String],
    vegetables: [String],
    greens: [String],
    carbs: [String]
  },
  benefits: [String],
  dailyCaloriesRange: {
    min: Number,
    max: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Diet', DietSchema);