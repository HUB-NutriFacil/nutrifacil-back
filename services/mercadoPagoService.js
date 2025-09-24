// mercadoPagoService.js - versão melhorada
const axios = require('axios');
const config = require('../config/environment');
const logger = require('../config/logger');

class MercadoPagoService {
  constructor() {
    if (!config.mercadoPago.accessToken) {
      throw new Error('Mercado Pago access token não configurado');
    }

    this.api = axios.create({
      baseURL: config.mercadoPago.baseUrl || 'https://api.mercadopago.com',
      headers: {
        'Authorization': `Bearer ${config.mercadoPago.accessToken}`,
        'Content-Type': 'application/json',
        'Timeout': 10000 // 10 segundos
      }
    });
  }

  async createPreference(preferenceData) {
    try {
      // Validação básica
      if (!preferenceData || !preferenceData.items || preferenceData.items.length === 0) {
        throw new Error('Dados da preferência inválidos');
      }

      const response = await this.api.post('/checkout/preferences', preferenceData);
      logger.info('Preferência criada com sucesso', { preferenceId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Erro ao criar preferência no Mercado Pago', {
        error: error.response?.data || error.message,
        requestData: preferenceData
      });
      throw this._handleError(error);
    }
  }

  async verifyPayment(paymentId) {
    try {
      if (!paymentId) throw new Error('ID de pagamento não fornecido');
      
      const response = await this.api.get(`/v1/payments/${paymentId}`);
      logger.info('Pagamento verificado', { paymentId, status: response.data.status });
      return response.data;
    } catch (error) {
      logger.error('Erro ao verificar pagamento no Mercado Pago', {
        paymentId,
        error: error.response?.data || error.message
      });
      throw this._handleError(error);
    }
  }

  _handleError(error) {
    // Tratamento específico para erros do Mercado Pago
    if (error.response) {
      const mpError = error.response.data;
      return {
        status: error.response.status,
        code: mpError.error || mpError.code,
        message: mpError.message || 'Erro na API do Mercado Pago',
        details: mpError.cause || []
      };
    }
    return {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: error.message || 'Erro ao se comunicar com o Mercado Pago'
    };
  }
}

module.exports = new MercadoPagoService();