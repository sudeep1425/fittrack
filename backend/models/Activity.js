const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    steps:           { type: Number, default: 0 },
    calories_burned: { type: Number, default: 0 },
    activity_type:   { type: String },
    date:            { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
