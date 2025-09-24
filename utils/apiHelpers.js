const axios = require('axios');
const logger = require('../config/logger');
const { HTTP_STATUS, ERROR_MESSAGES } = require('./constants');

class ApiHelpers {
  /**
   * Faz uma requisição HTTP com tratamento de erros
   * @param {Object} config - Configuração do Axios
   * @returns {Promise<Object>} - Resposta da API
   */
  static async makeRequest(config) {
    try {
      const response = await axios({
        ...config,
        timeout: 10000, // 10 segundos de timeout
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        }
      });
      
      return response.data;
      
    } catch (error) {
      logger.error(`API Request Error: ${error.message}`, {
        url: config.url,
        method: config.method,
        error: error.response?.data || error.message
      });
      
      if (error.response) {
        // Erro da API externa
        throw {
          status: error.response.status,
          message: error.response.data?.message || ERROR_MESSAGES.API_ERROR,
          details: error.response.data
        };
      } else if (error.request) {
        // Sem resposta da API
        throw {
          status: HTTP_STATUS.SERVER_ERROR,
          message: 'O serviço externo não respondeu',
          details: error.message
        };
      } else {
        // Erro na configuração
        throw {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Erro na configuração da requisição',
          details: error.message
        };
      }
    }
  }

  /**
   * Formata a resposta de APIs de IA para o padrão do sistema
   * @param {Object} aiResponse - Resposta bruta da API de IA
   * @returns {Object} - Resposta formatada
   */
  static formatAIResponse(aiResponse) {
    try {
      // Extrai JSON de respostas textuais (como do GPT)
      if (typeof aiResponse === 'string') {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) aiResponse = JSON.parse(jsonMatch[0]);
      }
      
      return {
        meals: aiResponse.meals?.map(meal => ({
          ...meal,
          foods: meal.foods?.map(food => ({
            name: food.name.trim(),
            quantity: food.quantity || '100g',
            calories: food.calories || 0,
            nutrients: food.nutrients || {}
          })) || []
        })) || [],
        nutritionalTips: aiResponse.nutritionalTips || '',
        metadata: aiResponse.metadata || {}
      };
      
    } catch (error) {
      logger.error('Error formatting AI response', error);
      throw {
        status: HTTP_STATUS.SERVER_ERROR,
        message: 'Erro ao processar resposta da IA',
        details: error.message
      };
    }
  }

  /**
   * Valida o formato da resposta da API de nutrição
   * @param {Object} response - Resposta da API
   * @param {Array} requiredFields - Campos obrigatórios
   */
  static validateNutritionResponse(response, requiredFields = ['foods']) {
    const missingFields = requiredFields.filter(field => !response[field]);
    
    if (missingFields.length > 0) {
      throw {
        status: HTTP_STATUS.SERVER_ERROR,
        message: 'Resposta da API de nutrição inválida',
        details: `Campos faltantes: ${missingFields.join(', ')}`
      };
    }
  }
}

module.exports = ApiHelpers;