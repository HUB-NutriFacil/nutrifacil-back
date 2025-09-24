const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');
const logger = require('./logger'); // Importando o logger personalizado

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      serverApi: ServerApiVersion.v1,
      maxPoolSize: 10, // Número máximo de conexões no pool
      connectTimeoutMS: 5000, // Timeout de conexão
      socketTimeoutMS: 45000 // Timeout de operações
    });

    logger.info('✅ Conectado ao MongoDB com sucesso', {
      host: conn.connection.host,
      port: conn.connection.port,
      dbName: conn.connection.name
    });
  } catch (err) {
    logger.error('❌ Falha na conexão com MongoDB:', {
      error: err.message,
      stack: err.stack,
      connectionString: process.env.MONGODB_URI ? 
        `${process.env.MONGODB_URI.split('@')[1]?.split('/')[0] || 'hidden'}` : 
        'undefined'
    });
    process.exit(1);
  }
};

// Eventos de conexão
mongoose.connection.on('connected', () => {
  logger.debug('🟢 Mongoose conectado ao banco de dados', {
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.db?.databaseName
  });
});

mongoose.connection.on('error', (err) => {
  logger.error('🔴 Erro na conexão do Mongoose:', {
    error: err.message,
    stack: err.stack,
    readyState: mongoose.connection.readyState
  });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('🟡 Mongoose desconectado', {
    readyState: mongoose.connection.readyState
  });
});

// Log de queries em ambiente de desenvolvimento
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    logger.debug('MongoDB Query', {
      collection: collectionName,
      method,
      query: JSON.stringify(query),
      doc: JSON.stringify(doc)
    });
  });
}

// Fechar conexão ao encerrar a aplicação
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('⏹️ Conexão com MongoDB fechada devido ao término da aplicação');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Erro ao fechar conexão com MongoDB:', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
});

module.exports = connectDB;