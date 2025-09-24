const AIService = require('../services/aiService');
const fs = require('fs');
const path = require('path');

// Mock completo da resposta
const mockAIResponse = {
  dietPlan: {
    description: "Plano mockado",
    dailyCalories: 2000,
    macronutrients: {
      protein: { grams: 150, percentage: 30 },
      carbs: { grams: 200, percentage: 40 },
      fats: { grams: 67, percentage: 30 }
    },
    meals: [{
      type: "Café da Manhã",
      foods: [{
        name: "Omelete",
        category: "Proteína",
        quantity: "2 ovos",
        calories: 280
      }]
    }],
    hydration: {
      waterIntake: 2500,
      recommendations: "Beber água"
    },
    nutritionalTips: "Dicas mockadas"
  }
};

// Teste com mock corrigido
async function testWithMock() {
  console.log('🧪 Testando com mock...');
  
  const originalMethod = AIService.generateDietPlan;
  AIService.generateDietPlan = async () => mockAIResponse;
  
  try {
    const result = await AIService.generateDietPlan({});
    console.log('✅ Mock testado com sucesso!');
    console.log('Dados retornados:', {
      description: result.description,
      meals: result.meals.map(m => m.type) // Agora funciona
    });
  } catch (error) {
    console.error('❌ Erro no teste com mock:', error);
  } finally {
    AIService.generateDietPlan = originalMethod;
  }
}

// Restante do código permanece igual...