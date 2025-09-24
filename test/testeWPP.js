// testeWPP.js
const WhatsAppService = require('../services/whatsAppService');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

// Configurações para teste (pode ser movido para .env depois)
const TEST_CONFIG = {
  TWILIO_ACCOUNT_SID: 'TWILIO_ACCOUNT_SID',
  TWILIO_AUTH_TOKEN: 'TWILIO_AUTH_TOKEN', 
  TWILIO_WHATSAPP_NUMBER: 'whatsapp:+14155238886', // Número sandbox da Twilio
  TEST_PHONE: '+5531982795537' // Substitua por seu número real com código do país
};

// Mock do config para teste
const config = {
  twilio: {
    accountSid: TEST_CONFIG.TWILIO_ACCOUNT_SID,
    authToken: TEST_CONFIG.TWILIO_AUTH_TOKEN,
    whatsAppNumber: TEST_CONFIG.TWILIO_WHATSAPP_NUMBER
  }
};

// Injeta a configuração mockada
WhatsAppService.config = config;

// Dados mockados do usuário
const mockUserData = {
  name: "João Silva",
  age: 30,
  height: 175,
  weight: 70,
  goal: "Perda de peso"
};

// Caminho para um PDF de teste (crie um arquivo simples ou use um existente)
const testPdfPath = path.join(__dirname, 'test-document.pdf');

// Função para criar um PDF simples para teste
function createTestPdf() {
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  
  const doc = new PDFDocument();
  const outputPath = testPdfPath;
  doc.pipe(fs.createWriteStream(outputPath));
  
  doc.fontSize(25).text('Teste de PDF', 100, 100);
  doc.fontSize(14).text('Este é um documento de teste para o serviço de WhatsApp.', 100, 150);
  
  doc.end();
  return new Promise(resolve => {
    doc.on('finish', () => resolve(outputPath));
  });
}

// Fluxo principal de teste
(async () => {
  try {
    console.log('🛠️ Preparando teste...');
    
    // 1. Criar PDF de teste
    if (!fs.existsSync(testPdfPath)) {
      console.log('📄 Criando PDF de teste...');
      await createTestPdf();
    }
    
    console.log('✅ PDF de teste pronto:', testPdfPath);
    
    // 2. Testar envio de mensagem simples
    console.log('\n📤 Testando envio de mensagem simples...');
    const simpleMessage = await WhatsAppService.sendMessage(
      TEST_CONFIG.TEST_PHONE,
      'Esta é uma mensagem de teste do EasyNutri!'
    );
    console.log('✅ Mensagem enviada. SID:', simpleMessage.sid);
    
    // 3. Testar envio de documento
    console.log('\n📎 Testando envio de documento...');
    const documentMessage = await WhatsAppService.sendDocument(
      TEST_CONFIG.TEST_PHONE,
      'Segue seu documento de teste!',
      testPdfPath,
      'Teste_EasyNutri.pdf'
    );
    console.log('✅ Documento enviado. SID:', documentMessage.sid);
    
    // 4. Testar fluxo completo de envio de plano nutricional
    console.log('\n🍎 Testando envio de plano nutricional...');
    const dietPlanMessage = await WhatsAppService.sendDietPlan(
      TEST_CONFIG.TEST_PHONE,
      mockUserData,
      testPdfPath
    );
    console.log('✅ Plano nutricional enviado. SID:', dietPlanMessage.sid);
    
    console.log('\n🎉 Todos os testes foram concluídos com sucesso!');
    console.log('Verifique seu WhatsApp para confirmar o recebimento.');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
})();