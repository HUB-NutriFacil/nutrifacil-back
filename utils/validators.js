const {
  DIET_TYPES,
  GENDERS,
  GOALS,
  ALLERGIES,
  FOOD_CATEGORIES,
  HTTP_STATUS
} = require('./constants');

const validateUserInput = (userData) => {
  const errors = [];
  
  if (!DIET_TYPES.includes(userData.dietType)) {
    errors.push(`Tipo de dieta inválido. Opções: ${DIET_TYPES.join(', ')}`);
  }

  if (!GENDERS.includes(userData.gender)) {
    errors.push(`Gênero inválido. Opções: ${GENDERS.join(', ')}`);
  }

  if (!GOALS.includes(userData.goal)) {
    errors.push(`Objetivo inválido. Opções: ${GOALS.join(', ')}`);
  }

  if (userData.allergies.some(a => !ALLERGIES.includes(a))) {
    errors.push(`Alergia inválida. Opções: ${ALLERGIES.join(', ')}`);
  }

  Object.entries(userData.foodPreferences || {}).forEach(([category, items]) => {
    if (!FOOD_CATEGORIES.includes(category)) {
      errors.push(`Categoria de alimento inválida: ${category}`);
    }
  });

  return errors.length > 0 ? errors : null;
};

const validateAIResponse = (response) => {
  const requiredFields = ['meals', 'dailyCalories', 'waterIntake'];
  const missingFields = requiredFields.filter(field => !response[field]);
  
  if (missingFields.length > 0) {
    return {
      status: HTTP_STATUS.SERVER_ERROR,
      message: 'Resposta da IA incompleta',
      details: `Campos faltantes: ${missingFields.join(', ')}`
    };
  }
  return null;
};

module.exports = {
  validateUserInput,
  validateAIResponse
};