const CalculationService = require('../services/calculationService');

exports.calculateTMB = (req, res) => {
  try {
    const { weight, height, age, gender } = req.body;
    const tmb = CalculationService.calculateTMB({ weight, height, age, gender });
    
    res.json({
      success: true,
      data: { tmb }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.calculateIMC = (req, res) => {
  try {
    const { weight, height } = req.body;
    const imc = CalculationService.calculateIMC({ weight, height });
    const category = CalculationService.getIMCCategory(imc);
    
    res.json({
      success: true,
      data: { imc, category }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.calculateWater = (req, res) => {
  try {
    const { weight } = req.body;
    const waterIntake = CalculationService.calculateWaterIntake({ weight });
    
    res.json({
      success: true,
      data: { waterIntake }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};