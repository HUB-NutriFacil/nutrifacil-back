const express = require('express');
const router = express.Router();
const FoodController = require('../controllers/foodController');

/**
 * @route GET /api/foods
 * @desc Get all foods
 * @access Public
 */
router.get('/', FoodController.getAllFoods);

/**
 * @route GET /api/foods/:category
 * @desc Get foods by category
 * @access Public
 */
router.get('/:category', FoodController.getFoodsByCategory);

/**
 * @route POST /api/foods
 * @desc Create new food item
 * @access Private (Admin)
 */
router.post('/', FoodController.createFood);

module.exports = router;