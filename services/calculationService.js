class CalculationService {
  static calculateTMB(user) {
    const { weight, height, age, gender } = user;
    if (gender === 'Masculino') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    }
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }

  static calculateIMC(user) {
    const { weight, height } = user;
    return (weight / ((height / 100) ** 2)).toFixed(2);
  }

  static calculateWaterIntake(user) {
    return (35 * user.weight).toFixed(0);
  }

  static getIMCCategory(imc) {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc <= 24.9) return 'Peso normal';
    if (imc <= 29.9) return 'Sobrepeso';
    return 'Obesidade';
  }
}

module.exports = CalculationService;