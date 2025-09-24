// @filename: routes/dietPlanRoutes.js
const express = require('express');
const router = express.Router();
const DietPlanController = require('../controllers/dietPlanController');

// @route   POST /api/diet-plans/generate
// @desc    Generate personalized diet plan using AI
// @access  Public
router.post('/generate', DietPlanController.generateDietPlan);

// @route   POST /api/diet-plans/send-whatsapp
// @desc    Send generated diet plan via WhatsApp
// @access  Public
router.post('/send-whatsapp', DietPlanController.sendDietPlanViaWhatsApp);

// @route   POST /api/diet-plans/full-process
// @desc    Complete flow: generate PDF and send via WhatsApp
// @access  Public
router.post('/full-process', DietPlanController.fullProcess);

module.exports = router;