const mongoose = require('mongoose');

const waterIntakeSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount:  { type: Number, default: 0 },
    date:    { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WaterIntake', waterIntakeSchema);
