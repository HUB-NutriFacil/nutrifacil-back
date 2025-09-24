// testePDF.js
const PDFService = require('../services/pdfService'); // Ajuste o caminho conforme necessário
const path = require('path');

// Dados de exemplo para o usuário
const userData = {
  name: "João Silva",
  age: 35,
  height: 175, // cm
  weight: 80,  // kg
  goal: "Perda de peso",
  dietType: "Equilibrada"
};

// Recomendações de exemplo
const recommendation = {
  dailyCalories: 2200,
  waterIntake: 2500,
  macronutrients: {
    protein: { grams: 150, percentage: 30 },
    carbs: { grams: 220, percentage: 40 },
    fats: { grams: 73, percentage: 30 }
  },
  meals: [
    {
      mealType: "Café da Manhã",
      foods: [
        { name: "Omelete", quantity: "2 ovos", calories: 140, category: "Proteína" },
        { name: "Pão integral", quantity: "1 fatia", calories: 80, category: "Carboidrato" }
      ]
    },
    {
      mealType: "Almoço",
      foods: [
        { name: "Frango grelhado", quantity: "150g", calories: 330, category: "Proteína" },
        { name: "Arroz integral", quantity: "1/2 xícara", calories: 110, category: "Carboidrato" },
        { name: "Brócolis", quantity: "1 xícara", calories: 55, category: "Vegetal", notes: "Cozinhar no vapor" }
      ]
    }
  ],
  nutritionalTips: "Mantenha-se hidratado e faça refeições a cada 3 horas para manter o metabolismo ativo."
};

// Pasta de saída (usando a pasta atual)
const outputPath = path.join(__dirname, 'output');

// Verifica se a pasta existe, se não, cria
const fs = require('fs');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

// Gera o PDF
console.log("Gerando PDF de teste...");
PDFService.generateDietPDF(recommendation, userData, outputPath)
  .then((pdfPath) => {
    console.log(`PDF gerado com sucesso em: ${pdfPath}`);
    console.log("Abrindo o arquivo...");
    
    // Tenta abrir o arquivo no visualizador padrão (funciona em Windows, Mac e Linux)
    const { exec } = require('child_process');
    const opener = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    exec(`${opener} "${pdfPath}"`);
  })
  .catch((error) => {
    console.error("Erro ao gerar PDF:", error);
  });