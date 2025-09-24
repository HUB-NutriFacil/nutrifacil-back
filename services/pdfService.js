const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const CalculationService = require('./calculationService');

class PDFService {
  static async generateDietPDF(recommendation, userData, outputPath = '') {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `diet_plan_${userData.name || 'user'}_${Date.now()}.pdf`;
        const fullPath = path.join(outputPath, fileName);
        const stream = fs.createWriteStream(fullPath);

        doc.pipe(stream);

        // Chamando os métodos corretamente como funções estáticas
        PDFService._addHeader(doc, userData);
        PDFService._addUserInfo(doc, userData);
        PDFService._addNutritionalSummary(doc, recommendation);
        PDFService._addMealPlan(doc, recommendation);
        PDFService._addTipsAndFooter(doc, recommendation);

        doc.end();

        stream.on('finish', () => resolve(fullPath));
        stream.on('error', reject);
      } catch (error) {
        logger.error('PDF generation error:', error);
        reject(error);
      }
    });
  }

  static _addHeader(doc, userData) {
    // Implementação do cabeçalho...
    const gradient = doc.linearGradient(0, 0, 0, 80);
    gradient.stop(0, '#00796b');
    gradient.stop(1, '#009688');
    
    doc.fill(gradient)
       .rect(0, 0, 612, 80)
       .fill();
    
    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('PLANO NUTRICIONAL PERSONALIZADO', { 
         align: 'center',
         y: 30
       });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Preparado para ${userData.name || 'Cliente'}`, { 
         align: 'center',
         y: 58
       });

    doc.strokeColor('#e0f2f1')
       .lineWidth(1)
       .moveTo(50, 85)
       .lineTo(562, 85)
       .stroke()
       .moveDown(1);
  }

  static _addUserInfo(doc, userData) {
    // Implementação das informações do usuário...
    doc.fillColor('#00796b')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('INFORMAÇÕES DO USUÁRIO', { underline: false })
       .moveDown(0.3);

    const imc = CalculationService.calculateIMC(userData);
    const imcCategory = CalculationService.getIMCCategory(imc);
    const formattedIMC = typeof imc === 'number' ? imc.toFixed(1) : 'N/A';
    
    doc.fill('#f5fbfa')
       .stroke('#e0f2f1')
       .lineWidth(0.5);
    doc.roundedRect(50, doc.y, 512, 95, 5)
       .fillAndStroke();
    
    doc.fillColor('#455a64')
       .fontSize(10)
       .font('Helvetica')
       .text(`Idade: ${userData.age || 'N/A'} anos`, 60, doc.y + 10)
       .text(`Altura: ${userData.height || 'N/A'} cm`, 60, doc.y + 25)
       .text(`Peso: ${userData.weight || 'N/A'} kg`, 60, doc.y + 40)
       .text(`IMC: ${formattedIMC} (${imcCategory || 'N/A'})`, 60, doc.y + 55)
       .text(`Sexo: ${userData.sexo || 'Não informado'}`, 60, doc.y + 70)
       .text(`Objetivo: ${userData.objetivo || 'Não especificado'}`, 220, doc.y + 10)
       .text(`Dieta: ${userData.dieta || 'Padrão'}`, 220, doc.y + 25)
       .text(`Alergias: ${userData.alergias || 'Nenhuma'}`, 220, doc.y + 40)
       .text(`Preferências: ${userData.preferencia || 'Nenhuma'}`, 220, doc.y + 55);

    doc.y += 100;
  }

  static _addNutritionalSummary(doc, recommendation) {
    // Implementação do resumo nutricional...
    doc.fillColor('#00796b')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('RESUMO NUTRICIONAL', { underline: false })
       .moveDown(0.3);

    doc.fill('#f5fbfa')
       .stroke('#e0f2f1')
       .lineWidth(0.5);
    doc.roundedRect(50, doc.y, 512, 120, 5)
       .fillAndStroke();
        
    doc.fillColor('#455a64')
       .fontSize(10)
       .font('Helvetica')
       .text(`Calorias Diárias: ${recommendation.dailyCalories?.toFixed(0) || 'N/A'} kcal`, 60, doc.y + 10)
       .text(`Ingestão de Água: ${recommendation.hydration?.waterIntake || 'N/A'} ml/dia`, 60, doc.y + 25)
       .text(`Descrição: ${recommendation.description || ''}`, 60, doc.y + 40, {
         width: 490,
         lineGap: 3
       });
    
    const startX = 60;
    const startY = doc.y + 60;
    const macronutrients = recommendation.macronutrients || {};
    
    doc.fill('#00796b')
       .rect(startX, startY, 490, 15)
       .fill()
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(9)
       .text('MACRONUTRIENTE', startX + 10, startY + 4)
       .text('GRAMAS/DIA', startX + 180, startY + 4)
       .text('% DIÁRIA', startX + 320, startY + 4);

    const nutrients = [
      { name: 'Proteínas', data: macronutrients.protein },
      { name: 'Carboidratos', data: macronutrients.carbs },
      { name: 'Gorduras', data: macronutrients.fats }
    ];
    
    nutrients.forEach((nutrient, index) => {
      const yPos = startY + 15 + (index * 15);
      const bgColor = index % 2 === 0 ? '#f8f8f8' : '#ffffff';
      
      doc.fill(bgColor)
         .rect(startX, yPos, 490, 15)
         .fill()
         .fillColor('#455a64')
         .font('Helvetica')
         .fontSize(9)
         .text(nutrient.name, startX + 10, yPos + 4)
         .text(nutrient.data?.grams ? nutrient.data.grams.toFixed(1) + 'g' : 'N/A', startX + 180, yPos + 4)
         .text(nutrient.data?.percentage ? nutrient.data.percentage.toFixed(0) + '%' : 'N/A', startX + 320, yPos + 4);
    });

    doc.y = startY + 75;
  }

  static _addMealPlan(doc, recommendation) {
    doc.fillColor('#00796b')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('PLANO ALIMENTAR DIÁRIO', { underline: false })
       .moveDown(0.5);

    (recommendation.meals || []).forEach(meal => {
      doc.fill('#00796b')
         .roundedRect(50, doc.y, 512, 15, 3)
         .fill()
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(meal.type?.toUpperCase() || 'REFEIÇÃO', 60, doc.y + 3);
      
      doc.y += 20;

      (meal.foods || []).forEach((food, index) => {
        const bgColor = index % 2 === 0 ? '#f8f8f8' : '#ffffff';
        
        doc.fill(bgColor)
           .rect(50, doc.y, 512, 30)
           .fill();
        
        doc.fillColor('#263238')
           .font('Helvetica-Bold')
           .fontSize(9)
           .text(food.name || 'Alimento', 60, doc.y + 5)
           .fillColor('#546e7a')
           .font('Helvetica')
           .fontSize(8)
           .text(`Quantidade: ${food.quantity || 'N/A'} | Calorias: ${food.calories || 'N/A'} kcal`, 
                 60, doc.y + 15)
           .text(`Categoria: ${food.category || 'N/A'}`, 250, doc.y + 5);
        
        if (food.notes) {
          doc.fontSize(7)
             .text(`Obs: ${food.notes}`, 400, doc.y + 5, { 
                 width: 150,
                 lineGap: 1
             });
        }
        
        doc.y += 32;
      });
      
      doc.moveDown(0.3);
    });
  }

  static _addTipsAndFooter(doc, recommendation) {
    if (doc.y > doc.page.height - 150) {
      doc.addPage();
      doc.y = 50;
    }

    doc.moveDown(0.5)
       .fillColor('#00796b')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('DICAS NUTRICIONAIS', { underline: false })
       .moveDown(0.5);

    const tipsHeight = Math.min(80, doc.page.height - doc.y - 60);
    
    doc.fill('#f5fbfa')
       .stroke('#e0f2f1')
       .lineWidth(0.5)
       .roundedRect(50, doc.y, 512, tipsHeight, 5)
       .fillAndStroke()
       .fillColor('#455a64')
       .font('Helvetica')
       .fontSize(10)
       .text(recommendation.nutritionalTips || 'Nenhuma dica específica fornecida.', {
           x: 60,
           y: doc.y + 10,
           width: 492,
           align: 'left',
           lineGap: 4
       });
    
    doc.y += tipsHeight + 20;

    const footerText = 'Este plano foi gerado automaticamente com base em suas informações. Consulte um nutricionista para orientações personalizadas.';
    const copyrightText = `© ${new Date().getFullYear()} NutriApp - Todos os direitos reservados`;

    if (doc.y > doc.page.height - 50) {
      doc.addPage();
      doc.y = 50;
    }

    doc.fillColor('#78909c')
       .fontSize(9)
       .text(footerText, {
           align: 'center',
           width: 500,
           x: 56
       })
       .moveDown(0.5)
       .fillColor('#b0bec5')
       .text(copyrightText, {
           align: 'center'
       });
  }
}

module.exports = PDFService;