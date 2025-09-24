const express = require('express');
const router = express.Router();
const CalculationController = require('../controllers/calculations');

// @route   POST /api/calculations/tmb
// @desc    Calculate Basal Metabolic Rate (TMB)
// @access  Public
router.post('/tmb', CalculationController.calculateTMB);

// @route   POST /api/calculations/imc
// @desc    Calculate Body Mass Index (IMC)
// @access  Public
router.post('/imc', CalculationController.calculateIMC);

// @route   POST /api/calculations/water
// @desc    Calculate daily water intake
// @access  Public
router.post('/water', CalculationController.calculateWater);

module.exports = router;
