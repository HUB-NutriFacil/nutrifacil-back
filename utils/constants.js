module.exports = {
  // Tipos de dieta suportados
  DIET_TYPES: Object.freeze([
    'Mediterrânea',
    'Low Carb', 
    'Cetogênica',
    'Vegetariana'
  ]),

  // Gêneros suportados
  GENDERS: Object.freeze(['Masculino', 'Feminino']),

  // Objetivos do usuário
  GOALS: Object.freeze(['Emagrecimento', 'Hipertrofia']),

  // Alergias conhecidas
  ALLERGIES: Object.freeze([
    'Lactose',
    'Glúten',
    'Proteína do leite',
    'Ovo',
    'Frutos do mar',
    'Nenhuma'
  ]),

  // Categorias de alimentos
  FOOD_CATEGORIES: Object.freeze([
    'proteins',
    'vegetables',
    'greens',
    'carbs',
    'fruits',
    'fats'
  ]),

  // Tipos de refeição
  MEAL_TYPES: Object.freeze([
    'Café da manhã',
    'Lanche da manhã',
    'Almoço',
    'Lanche da tarde',
    'Jantar',
    'Ceia'
  ]),

  // Fatores de atividade física
  ACTIVITY_FACTORS: Object.freeze({
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9
  }),

  // Códigos de status HTTP comuns
  HTTP_STATUS: Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500
  }),

  // Mensagens de erro comuns
  ERROR_MESSAGES: Object.freeze({
    INVALID_DIET: 'Tipo de dieta inválido',
    INVALID_USER_DATA: 'Dados do usuário inválidos',
    API_LIMIT_EXCEEDED: 'Limite de requisições excedido',
    AI_SERVICE_ERROR: 'Erro no serviço de IA'
  }),

  // Configurações de nutrição
  NUTRITION: Object.freeze({
    WATER_PER_KG: 35, // ml por kg
    PROTEIN_PER_KG: { // gramas por kg
      weight_loss: 1.6,
      maintenance: 1.2,
      muscle_gain: 2.2
    }
  })
};