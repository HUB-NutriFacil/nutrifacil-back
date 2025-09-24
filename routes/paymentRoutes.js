const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const PaymentNotificationService = require('../services/paymentNotificationService');

// Endpoint para criar preferência de pagamento
router.post('/create_preference', async (req, res) => {
  console.log("Dados recebidos:", req.body);
  try {
    const { celular, dieta, peso, altura, idade, sexo, alergias, objetivo, preferencia, whatsapp } = req.body;
    const userData = {
      phone: celular,
      dieta,
      peso,
      altura,
      idade,
      sexo,
      alergias,
      objetivo,
      preferencia,
      whatsapp
    };
    const dietPlan = {
      type: 'Plano Básico', // Exemplo de tipo de plano
      price: 10.00, // Exemplo de preço
    };
    const preference = await PaymentNotificationService.createPaymentPreference(userData, dietPlan);
    res.json(preference);
  } catch (error) {
    console.error("Erro ao criar preferência de pagamento:", error);
    res.status(500).json({ error: 'Erro ao criar preferência de pagamento' });
  }
});
module.exports = router;

// Endpoint para confirmação de pagamento
router.post('/confirmation', async (req, res) => {
  try {
    const paymentData = req.body;
    // Aqui você pode processar os dados do pagamento, como verificar o status e atualizar o banco de dados
    await PaymentController.handlePaymentConfirmation(paymentData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar confirmação de pagamento' });
  }
});

module.exports = router;
