const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

const paymentController = new PaymentController();

/**
 * @route POST /api/payments/create_preference
 * @desc Cria uma preferência de pagamento no Mercado Pago
 * @access Public
 */
router.post('/create_preference', (req, res) => {
  paymentController.createPreference(req, res);
});

/**
 * @route POST /api/payments/webhook
 * @desc Recebe notificações de webhook do Mercado Pago
 * @access Public (Mercado Pago chama esta URL)
 */
router.post('/webhook', (req, res) => {
  paymentController.handlePaymentConfirmation(req, res);
});

/**
 * @route GET /api/payments/success
 * @desc Redirecionamento após pagamento aprovado
 * @access Public
 */
router.get('/success', (req, res) => {
  const { payment_id, external_reference } = req.query;
  // Redirecionar para página de sucesso no frontend
  res.redirect(`${process.env.FRONTEND_URL}/payment/success?payment_id=${payment_id}`);
});

/**
 * @route GET /api/payments/failure
 * @desc Redirecionamento após pagamento recusado
 * @access Public
 */
router.get('/failure', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payment/error`);
});

/**
 * @route GET /api/payments/pending
 * @desc Redirecionamento após pagamento pendente
 * @access Public
 */
router.get('/pending', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payment/pending`);
});

module.exports = router;