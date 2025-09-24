const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const logger = require('../config/logger');
const PDFService = require('./pdfService');
const config = require('../config/environment');

class PaymentNotificationService {
  constructor() {
    this.mercadoPagoConfig = {
      accessToken: config.mercadoPago.accessToken,
      apiUrl: config.mercadoPago.apiUrl || 'https://api.mercadopago.com'
    };

  }

  async handlePaymentNotification(paymentId) {
    try {
      // 1. Verificar o pagamento no Mercado Pago
      const payment = await this._verifyMercadoPagoPayment(paymentId);
      
      // 2. Validar se o pagamento foi aprovado
      if (payment.status !== 'approved') {
        throw new Error(`Pagamento não aprovado. Status: ${payment.status}`);
      }

      // 3. Extrair dados do usuário do metadata do pagamento
      const userData = payment.metadata.userData;
      const userId = payment.metadata.userId;

      if (!userData || !userId) {
        throw new Error('Dados do usuário não encontrados no pagamento');
      }

      // 4. Gerar o PDF da dieta
      const recommendation = await RecommendationService.generateRecommendation(userId, userData);
      const pdfPath = await PDFService.generateDietPDF(recommendation, userData);

      // 5. Enviar o PDF via WhatsApp
      await this._sendWhatsAppMessage(
        userData.phone,
        'Seu plano nutricional está pronto! Aqui está o documento com todas as informações da sua dieta.',
        pdfPath
      );

      logger.info(`PDF enviado com sucesso para ${userData.phone}`);
      return { success: true, message: 'PDF enviado com sucesso' };

    } catch (error) {
      logger.error('Erro no processamento do pagamento:', error);
      throw error;
    }
  }

  async _verifyMercadoPagoPayment(paymentId) {
    try {
      const response = await axios.get(
        `${this.mercadoPagoConfig.apiUrl}/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.mercadoPagoConfig.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Erro ao verificar pagamento no Mercado Pago:', error.response?.data || error.message);
      throw new Error('Falha ao verificar pagamento no Mercado Pago');
    }
  }

  async _sendWhatsAppMessage(recipientNumber, message, filePath = null) {
    try {
      const formData = new FormData();

      // Adicionar parâmetros básicos da mensagem
      formData.append('recipient', recipientNumber);
      formData.append('message', message);
      formData.append('sender', this.whatsAppConfig.senderNumber);

      // Se houver arquivo, adicionar ao formData
      if (filePath) {
        formData.append('file', fs.createReadStream(filePath)), {
          filename: 'plano_nutricional.pdf',
          contentType: 'application/pdf'
        };
      }

      const response = await axios.post(
        `${this.whatsAppConfig.apiUrl}/send`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.whatsAppConfig.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Erro ao enviar mensagem pelo WhatsApp:', error.response?.data || error.message);
      throw new Error('Falha ao enviar mensagem pelo WhatsApp');
    }
  }

async createPaymentPreference(userData, dietPlan) {
  try {
    // Validação de campos obrigatórios
    if (!userData.name || !userData.email || !userData.phone) {
      throw new Error('Dados do usuário incompletos para pagamento');
    }

    // Garantir que o preço seja válido
    const price = dietPlan.price || 97.90; // Valor padrão de fallback
    
    // Formatar telefone
    const cleanedPhone = userData.phone.replace(/\D/g, '');
    const area_code = cleanedPhone.substring(0, 2);
    const number = cleanedPhone.substring(2);

    // Montar payload com fallbacks
    const preferenceData = {
      items: [
        { 
          title: `Plano Nutricional - ${dietPlan.type || 'Personalizado'}`,
          description: `Plano para ${userData.name}`,
          quantity: 1,
          unit_price: Number(price),
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: userData.name,
        email: userData.email,
        phone: { area_code, number }
      },
      payment_methods: {
        excluded_payment_types: [{ id: 'ticket' }],
        installments: 1
      },
      notification_url: `${config.api.baseUrl}/payment/webhook`,
      external_reference: `user_${userData.id || 'temp'}`,
      metadata: {
        userId: userData.id || 'temp-user',
        userData: JSON.stringify(userData),
        dietType: dietPlan.type || 'Standard'
      },
      back_urls: {
        success: `${config.web.url}/payment/success`,
        pending: `${config.web.url}/payment/pending`,
        failure: `${config.web.url}/payment/failure`
      },
      auto_return: 'approved'
    };

    // Log para depuração
    logger.info('Enviando ao Mercado Pago:', preferenceData);

    const response = await axios.post(
      `${this.mercadoPagoConfig.apiUrl}/checkout/preferences`,
      preferenceData,
      {
        headers: {
          'Authorization': `Bearer ${this.mercadoPagoConfig.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return {
      paymentUrl: response.data.init_point || response.data.sandbox_init_point,
      paymentId: response.data.id
    };
  } catch (error) {
    // Log detalhado
    const errorDetails = error.response 
      ? `Status: ${error.response.status} - Data: ${JSON.stringify(error.response.data)}`
      : error.message;

    logger.error('Erro detalhado ao criar preferência:', errorDetails);
    
    throw new Error('Falha ao criar link de pagamento');
    } 
  }
}

module.exports = new PaymentNotificationService();