const mercadopago = require('mercadopago');

class MercadoPagoService {
  constructor() {
    mercadopago.configure({
      access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });
  }

  /**
   * Cria uma preferência de pagamento no Mercado Pago.
   * @param {Object} paymentData - Dados para a criação da preferência.
   * @param {string} paymentData.title - Título do item.
   * @param {string} paymentData.description - Descrição do item.
   * @param {number} paymentData.quantity - Quantidade do item.
   * @param {number} paymentData.unit_price - Preço unitário do item.
   * @param {string} paymentData.external_reference - ID de referência no seu sistema.
   * @returns {Promise<Object>} Resposta da API do Mercado Pago.
   */
  async createPaymentPreference(paymentData) {
    try {
      const preference = {
        items: [
          {
            title: paymentData.title,
            description: paymentData.description,
            quantity: paymentData.quantity,
            currency_id: 'BRL',
            unit_price: paymentData.unit_price,
          },
        ],
        external_reference: paymentData.external_reference,
        back_urls: {
          success: `${process.env.API_BASE_URL}/api/payments/success`,
          failure: `${process.env.API_BASE_URL}/api/payments/failure`,
          pending: `${process.env.API_BASE_URL}/api/payments/pending`,
        },
        auto_return: 'approved',
      };

      const response = await mercadopago.preferences.create(preference);
      return { success: true, body: response.body };
    } catch (error) {
      console.error('Erro ao criar preferência de pagamento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca informações de um pagamento pelo seu ID.
   * @param {string} paymentId - ID do pagamento no Mercado Pago.
   * @returns {Promise<Object>} Dados do pagamento.
   */
  async getPayment(paymentId) {
    try {
      const response = await mercadopago.payment.get(paymentId);
      return { success: true, body: response.body };
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MercadoPagoService;