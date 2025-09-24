// @filename: controllers/dietPlanController.js
const AIService = require('../services/aiService');
const PDFService = require('../services/pdfService');
const WhatsAppService = require('../services/whatsAppService');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class DietPlanController {
  /**
   * @desc    Generate diet plan using AI
   * @route   POST /api/diet-plans/generate
   */
  static async generateDietPlan(req, res) {
    const correlationId = uuidv4();
    try {
      const { userData } = req.body;

      // Validação mais robusta
      if (!userData || typeof userData !== 'object') {
        logger.warn(`Invalid userData - Correlation ID: ${correlationId}`, { userData });
        return res.status(400).json({ 
          error: "Dados do usuário inválidos ou ausentes",
          correlationId
        });
      }

      // Campos obrigatórios
      const requiredFields = ['age', 'height', 'weight', 'goal', 'dietType'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        logger.warn(`Missing required fields - Correlation ID: ${correlationId}`, { 
          missingFields,
          receivedData: userData
        });
        return res.status(400).json({ 
          error: `Campos obrigatórios faltando: ${missingFields.join(', ')}`,
          requiredFields,
          correlationId
        });
      }

      // Adiciona fallbacks para campos opcionais
      const completeUserData = {
        name: userData.name || 'Usuário',
        age: Number(userData.age),
        height: Number(userData.height),
        weight: Number(userData.weight),
        goal: userData.goal,
        dietType: userData.dietType,
        sexo: userData.sexo || 'Não informado',
        alergias: userData.alergias || 'Nenhuma',
        preferencia: userData.preferencia || 'Nenhuma',
        phone: userData.phone || '',
        email: userData.email || ''
      };

      logger.info(`Generating diet plan - Correlation ID: ${correlationId}`, {
        userData: completeUserData
      });

      const dietPlan = await AIService.generateDietPlan(completeUserData);
      
      // Garante que o plano tenha um preço padrão
      if (!dietPlan.price) {
        dietPlan.price = 97.90;
      }

      logger.info(`Diet plan generated successfully - Correlation ID: ${correlationId}`);
      
      res.status(200).json({ 
        success: true, 
        dietPlan,
        correlationId
      });

    } catch (error) {
      logger.error('Generate diet plan error:', {
        error: error.message,
        stack: error.stack,
        correlationId,
        userData: req.body.userData || {}
      });
      
      // Mensagens de erro mais específicas
      let status = 500;
      let errorMessage = "Falha ao gerar plano alimentar";
      
      if (error.message.includes('Limite de requisições')) {
        status = 429;
        errorMessage = "Limite de requisições excedido. Tente novamente mais tarde.";
      } else if (error.message.includes('Dados incompletos')) {
        status = 400;
        errorMessage = error.message;
      }
      
      res.status(status).json({ 
        error: errorMessage,
        correlationId,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @desc    Send existing diet plan via WhatsApp
   * @route   POST /api/diet-plans/send-whatsapp
   */
  static async sendDietPlanViaWhatsApp(req, res) {
    const correlationId = uuidv4();
    try {
      const { phoneNumber, userData, pdfPath } = req.body;

      // Validação mais completa
      if (!phoneNumber || !/^\d+$/.test(phoneNumber.replace(/\D/g, ''))) {
        return res.status(400).json({ 
          error: "Número de telefone inválido",
          correlationId
        });
      }

      if (!pdfPath || !fs.existsSync(pdfPath)) {
        return res.status(400).json({ 
          error: "Arquivo PDF não encontrado",
          correlationId
        });
      }

      logger.info(`Sending diet plan via WhatsApp - Correlation ID: ${correlationId}`, {
        phoneNumber,
        pdfPath
      });

      await WhatsAppService.sendDietPlan(
        phoneNumber, 
        userData || {}, 
        pdfPath
      );

      res.status(200).json({ 
        success: true,
        correlationId
      });

    } catch (error) {
      logger.error('Send WhatsApp error:', {
        error: error.message,
        stack: error.stack,
        correlationId,
        requestData: req.body
      });
      
      res.status(500).json({ 
        error: "Falha ao enviar via WhatsApp",
        correlationId,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @desc    Complete process: generate + send
   * @route   POST /api/diet-plans/full-process
   */
  static async fullProcess(req, res) {
    const correlationId = uuidv4();
    try {
      const { userData } = req.body;

      logger.info(`Starting full process - Correlation ID: ${correlationId}`, {
        userData: userData ? { ...userData, phone: userData.phone } : null
      });

      // Validação reforçada
      if (!userData?.phone) {
        logger.warn(`Missing phone number - Correlation ID: ${correlationId}`);
        return res.status(400).json({ 
          error: "Número de telefone é obrigatório",
          correlationId
        });
      }

      // 1. Generate plan (reusa a lógica do método generateDietPlan)
      const generateResponse = await DietPlanController.generateDietPlan(req, { 
        json: (data) => data 
      });
      
      if (!generateResponse.success) {
        return res.status(generateResponse.statusCode || 500).json({
          error: generateResponse.error,
          correlationId
        });
      }

      const dietPlan = generateResponse.dietPlan;

      // 2. Create PDF
      const pdfDir = process.env.PDF_TEMP_DIR || path.join(__dirname, '../../temp');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const pdfPath = await PDFService.generateDietPDF(
        dietPlan, 
        userData, 
        pdfDir
      );

      logger.info(`PDF generated at ${pdfPath} - Correlation ID: ${correlationId}`);

      // 3. Send via WhatsApp
      await WhatsAppService.sendDietPlan(
        userData.phone,
        userData,
        pdfPath
      );

      // Limpeza opcional (em produção, considere um job separado)
      setTimeout(() => {
        try {
          fs.unlinkSync(pdfPath);
          logger.info(`Temporary PDF deleted - Correlation ID: ${correlationId}`);
        } catch (cleanupError) {
          logger.error('Error deleting temporary PDF:', {
            error: cleanupError.message,
            correlationId,
            pdfPath
          });
        }
      }, 300000); // 5 minutos depois

      res.status(200).json({ 
        success: true,
        correlationId,
        pdfGenerated: true,
        whatsappSent: true
      });

    } catch (error) {
      logger.error('Full process error:', {
        error: error.message,
        stack: error.stack,
        correlationId,
        userData: req.body.userData || {}
      });
      
      res.status(500).json({ 
        error: "Falha no processo completo",
        correlationId,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = DietPlanController;