
const AIService = require('../services/aiService');
const PDFService = require('../services/pdfService');
const WhatsAppService = require('../services/whatsAppService');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');
const azureStorage = require('azure-storage');

module.exports = async function (context, req) {
  try {
    // 1. Validação dos dados de entrada
    if (!req.body || !req.body.userData || !req.body.userData.phone) {
      context.res = {
        status: 400,
        body: { error: "Dados do usuário e telefone são obrigatórios." }
      };
      return;
    }

    const { userData } = req.body;
    const correlationId = uuidv4(); // Para rastreamento

    logger.info(`[${correlationId}] Iniciando processo para ${userData.name || 'usuário'}`);

    // 2. Gerar plano alimentar com IA
    const dietPlan = await AIService.generateDietPlan(userData);
    logger.info(`[${correlationId}] Plano gerado com sucesso`);

    // 3. Criar PDF temporário
    const tempPdfPath = `/tmp/diet_${correlationId}.pdf`;
    const finalPdfPath = await PDFService.generateDietPDF(dietPlan, userData, '/tmp');
    logger.info(`[${correlationId}] PDF gerado em: ${finalPdfPath}`);

    // 4. Upload para Azure Blob Storage (opcional)
    const blobService = azureStorage.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const blobName = `plans/${userData.phone}/${correlationId}.pdf`;
    await new Promise((resolve, reject) => {
      blobService.createBlockBlobFromLocalFile(
        'dietplans-container',
        blobName,
        finalPdfPath,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    const pdfUrl = blobService.getUrl('dietplans-container', blobName);
    logger.info(`[${correlationId}] PDF armazenado no Azure: ${pdfUrl}`);

    // 5. Enviar via WhatsApp
    await WhatsAppService.sendDietPlan(
      userData.phone,
      userData,
      finalPdfPath
    );
    logger.info(`[${correlationId}] Mensagem enviada com sucesso`);

    // 6. Limpeza (opcional)
    fs.unlinkSync(finalPdfPath);

    // 7. Resposta de sucesso
    context.res = {
      status: 200,
      body: { 
        success: true,
        planId: correlationId,
        blobUrl: pdfUrl
      }
    };

  } catch (error) {
    logger.error(`Erro no endpoint: ${error.message}`, error.stack);
    context.res = {
      status: 500,
      body: { 
        error: "Falha ao processar plano nutricional",
        details: process.env.NODE_ENV === 'development' ? error.message : null
      }
    };
  }
};