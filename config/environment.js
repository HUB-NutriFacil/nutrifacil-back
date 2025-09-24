require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
    apiVersion: 'v1'
  },

  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.DB_NAME || 'easynutri_db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: {
        version: require('mongodb').ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    }
  },

    pdf: {
    storagePath: process.env.PDF_STORAGE_PATH || './storage/pdfs', // Caminho padrão
    publicUrl: process.env.PDF_PUBLIC_URL || '/pdfs' // URL pública para acesso
  },

  //Substituir pela api da IA que vamos realmente utilizar
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo-0125',
    temperature: parseFloat(process.env.OPENAI_TEMP) || 0.7,
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
    timeout: parseInt(process.env.OPENAI_TIMEOUT) || 15000
  },

  nutrition: {
    waterPerKg: 35,
    proteinPerKg: {
      weight_loss: 1.6,
      maintenance: 1.4,
      muscle_gain: 2.2
    }
  },

  limits: {
    apiRateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    },
    aiDailyRequests: 20
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER
  },

   mercadoPago: {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN, // Adicione esta linha
    apiUrl: process.env.MERCADO_PAGO_API_URL || 'https://api.mercadopago.com' // Adicione esta linha
  },

};