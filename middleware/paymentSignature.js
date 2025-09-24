const crypto = require('crypto');

module.exports = function(req, res, next) {
  const signature = req.headers['x-payment-signature'];
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(403).json({ error: 'Assinatura inválida' });
  }

  next();
};