const twilio = require('twilio');
const fs = require('fs');
const logger = require('../config/logger');
const config = require('../config/environment');

class WhatsAppService {
  constructor() {
    // Verifica se as configurações necessárias estão presentes
    if (!config.twilio.accountSid || !config.twilio.authToken || !config.twilio.whatsAppNumber) {
      throw new Error('Configurações do Twilio não encontradas');
    }

    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    this.whatsAppNumber = config.twilio.whatsAppNumber;
  }

  /**
   * Envia uma mensagem via WhatsApp
   * @param {string} to - Número de telefone do destinatário (formato: +5511999999999)
   * @param {string} message - Mensagem a ser enviada
   * @returns {Promise<object>} - Resposta da Twilio
   */
  async sendMessage(to, message) {
    try {
      // Validação básica do número de telefone
      if (!to.startsWith('+')) {
        throw new Error('Número de telefone deve incluir código do país (ex: +55)');
      }

      const response = await this.client.messages.create({
        body: message,
        from: `whatsapp:${this.whatsAppNumber}`,
        to: `whatsapp:${to}`
      });

      logger.info(`Mensagem WhatsApp enviada para ${to} - SID: ${response.sid}`);
      return response;
    } catch (error) {
      logger.error('Erro ao enviar mensagem pelo WhatsApp:', error);
      throw new Error('Falha ao enviar mensagem pelo WhatsApp');
    }
  }

  /**
   * Envia um documento via WhatsApp
   * @param {string} to - Número de telefone do destinatário
   * @param {string} message - Mensagem acompanhando o documento
   * @param {string} filePath - Caminho do arquivo a ser enviado
   * @param {string} fileName - Nome do arquivo a ser exibido
   * @returns {Promise<object>} - Resposta da Twilio
   */
  async sendDocument(to, message, filePath, fileName = 'documento.pdf') {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('Arquivo não encontrado');
      }

      // Primeiro envia a mensagem de texto
      await this.sendMessage(to, message);

      // Depois envia o documento
      const response = await this.client.messages.create({
        mediaUrl: [filePath],
        body: fileName,
        from: `whatsapp:${this.whatsAppNumber}`,
        to: `whatsapp:${to}`
      });

      logger.info(`Documento enviado via WhatsApp para ${to} - SID: ${response.sid}`);
      return response;
    } catch (error) {
      logger.error('Erro ao enviar documento pelo WhatsApp:', error);
      throw new Error('Falha ao enviar documento pelo WhatsApp');
    }
  }

  /**
   * Envia o plano nutricional após o pagamento (integração com outros serviços)
   * @param {string} phoneNumber - Número do cliente
   * @param {object} userData - Dados do usuário
   * @param {string} pdfPath - Caminho do PDF gerado
   * @returns {Promise<object>} - Resposta da Twilio
   */
  async sendDietPlan(phoneNumber, userData, pdfPath) {
    const welcomeMessage = `Olá ${userData.name || 'cliente'}! 🎉\n\n` +
      'Seu plano nutricional personalizado está pronto!\n' +
      'Aqui está o documento com todas as informações da sua dieta.\n\n' +
      'Qualquer dúvida, estamos à disposição!';

    try {
      const response = await this.sendDocument(
        phoneNumber,
        welcomeMessage,
        pdfPath,
        `Plano_Nutricional_${userData.name || ''}.pdf`.replace(/\s+/g, '_')
      );

      // Opcional: enviar mensagem de acompanhamento após 1 minuto
      setTimeout(() => {
        this.sendMessage(
          phoneNumber,
          'Lembre-se de manter uma rotina de alimentação saudável e beber água regularmente! 💧🍎'
        ).catch(error => logger.error('Erro ao enviar mensagem de acompanhamento:', error));
      }, 60000);

      return response;
    } catch (error) {
      logger.error('Erro no envio do plano nutricional:', error);
      throw error;
    }
  }
}

// Exporta uma instância singleton do serviço
module.exports = new WhatsAppService();