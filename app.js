require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const logger = require('./config/logger'); // Importe seu logger

const app = express();
try {
  // Middlewares
  app.use(express.json());

  // Middleware de logging para todas as requisições
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  });

  // Conexão com o banco de dados
  connectDB();

  // Rotas
  app.get('/', (req, res) => {
    logger.debug('Acessando rota raiz');
    res.json({ message: 'API EasyNutri funcionando' });
  });

  // Suas rotas existentes
  app.use('/api/users', require('./routes/users'));
  app.use('/api/diets', require('./routes/diets'));
  app.use('/api/calculations', require('./routes/calculations'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/diet-plans', require('./routes/dietPlanRoutes'));

  // Manipulador de erros aprimorado
  app.use((err, req, res, next) => {
    logger.error('Erro interno:', {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      ...(process.env.NODE_ENV !== 'production' && { details: err.message })
    });
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`[TESTE] Servidor rodando na porta ${PORT}`); // Linha adicional
    logger.info(`Servidor rodando na porta ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  // Captura de erros não tratados
  process.on('unhandledRejection', (reason) => {
    logger.error('Rejeição não tratada:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Exceção não capturada:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Erro na inicialização:', error);
}
