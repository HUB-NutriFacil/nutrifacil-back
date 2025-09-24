const Food = require('../models/Food');
const { FOOD_CATEGORIES } = require('../utils/constants');

exports.getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find({});
    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar alimentos'
    });
  }
};

exports.getFoodsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!FOOD_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Categoria inválida'
      });
    }

    const foods = await Food.find({ category });
    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar alimentos por categoria'
    });
  }
};

exports.createFood = async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json({
      success: true,
      data: food
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};