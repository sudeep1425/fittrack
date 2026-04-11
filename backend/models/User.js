const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    email:         { type: String, required: true, unique: true },
    password:      { type: String, required: true },
    age:           { type: Number },
    gender:        { type: String },
    height:        { type: Number },
    weight:        { type: Number },
    profile_photo: { type: String },
    role:          { type: String, default: 'user' },
    calorieGoal:   { type: Number, default: 2000 },
    waterGoal:     { type: Number, default: 3000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
