const MercadoPagoService = require('../services/MercadoPagoService');
const logger = require('../config/logger');

class PaymentController {
  constructor() {
    this.mercadoPagoService = new MercadoPagoService();
  }

  /**
   * Cria uma preferência de pagamento
   */
  async createPreference(req, res) {
    try {
      const { 
        celular, 
        dieta, 
        peso, 
        altura, 
        idade, 
        sexo, 
        alergias, 
        objetivo, 
        preferencia, 
        whatsapp 
      } = req.body;

      // Validação básica dos dados obrigatórios
      if (!celular || !dieta || !objetivo) {
        return res.status(400).json({
          success: false,
          message: 'Celular, dieta e objetivo são campos obrigatórios.'
        });
      }

      // Calcular preço com base nos dados (exemplo)
      const unit_price = this._calculatePlanPrice(dieta, objetivo);
      
      const paymentData = {
        title: `Plano Nutricional - ${dieta}`,
        description: `Plano personalizado para ${objetivo}`,
        quantity: 1,
        unit_price: unit_price,
        external_reference: `user_${celular}_${Date.now()}`
      };

      const result = await this.mercadoPagoService.createPaymentPreference(paymentData);

      if (result.success) {
        logger.info(`Preferência criada com sucesso: ${result.body.id}`);
        res.status(200).json({
          success: true,
          init_point: result.body.init_point,
          preferenceId: result.body.id
        });
      } else {
        logger.error('Erro ao criar preferência:', result.error);
        res.status(500).json({
          success: false,
          message: 'Falha ao criar preferência de pagamento',
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Erro no controlador de preferência:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Processa confirmação de pagamento via webhook
   */
  async handlePaymentConfirmation(req, res) {
    try {
      const { type, data } = req.body;

      if (type === 'payment') {
        const paymentId = data.id;
        logger.info(`Webhook recebido para pagamento: ${paymentId}`);

        const paymentResult = await this.mercadoPagoService.getPayment(paymentId);
        
        if (paymentResult.success) {
          const payment = paymentResult.body;
          
          if (!this._validatePayment(payment)) {
            logger.warn(`Pagamento inválido: ${paymentId}`);
            return res.status(400).json({ success: false, message: 'Pagamento inválido' });
          }

          //Espaço reservado para implementar a lógica para atualizar o banco de dados
          await this._updatePaymentStatus(payment);
          
          logger.info(`Pagamento processado com sucesso: ${paymentId}`);
          return res.status(200).json({ success: true });
        } else {
          logger.error('Erro ao buscar pagamento:', paymentResult.error);
          return res.status(500).json({ success: false, message: 'Erro ao validar pagamento' });
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Erro no processamento de pagamento:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Valida dados do pagamento
   */
  _validatePayment(paymentData) {
    return (
      paymentData &&
      paymentData.id &&
      paymentData.status &&
      paymentData.external_reference &&
      ['approved', 'pending', 'authorized'].includes(paymentData.status)
    );
  }

  /**
   * Atualiza status do pagamento no banco de dados
   */
  async _updatePaymentStatus(payment) {
    try {
      // Implementar lógica de atualização banco de dados
      // usando payment.external_reference para encontrar o pedido
      // e payment.status para atualizar o status
      
      logger.info(`Status atualizado para: ${payment.status}, Referência: ${payment.external_reference}`);
      return true;
    } catch (error) {
      logger.error('Erro ao atualizar status do pagamento:', error);
      throw error;
    }
  }

  /**
   * Calcula preço do plano com base nas características
   */
  _calculatePlanPrice(dieta, objetivo) {
    // Exemplo de cálculo de preço - Mudar Futuramente
    const basePrice = 50.00;
    let multiplier = 1.0;

    if (dieta.includes('personalizada')) multiplier += 0.5;
    if (objetivo.includes('emagrecimento')) multiplier += 0.3;
    if (objetivo.includes('performance')) multiplier += 0.4;

    return parseFloat((basePrice * multiplier).toFixed(2));
  }
}

module.exports = PaymentController;