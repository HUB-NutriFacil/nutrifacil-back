const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Masculino', 'Feminino'], required: true },
  goal: { type: String, enum: ['Emagrecimento', 'Hipertrofia'], required: true },
  dietType: { 
    type: String, 
    enum: ['Mediterrânea', 'Low Carb', 'Cetogênica', 'Vegetariana'], 
    required: true 
  },
  allergies: { 
    type: [String], 
    enum: ['Lactose', 'Glúten', 'Proteína do leite', 'Ovo', 'Frutos do mar', 'Nenhuma'],
    default: ['Nenhuma']
  },
  foodPreferences: {
    proteins: [String],
    vegetables: [String],
    greens: [String],
    carbs: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);