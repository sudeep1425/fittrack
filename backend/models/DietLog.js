const mongoose = require('mongoose');

const dietLogSchema = new mongoose.Schema(
  {
    user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    food_name: { type: String, required: true },
    amount_grams: { type: Number, default: 100 },
    calories:  { type: Number, default: 0 },
    meal_type: { type: String },
    date:      { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DietLog', dietLogSchema);
