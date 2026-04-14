require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { connectDB } = require('./db');
const { auth, adminAuth } = require('./middleware/auth');

const User = require('./models/User');
const Activity = require('./models/Activity');
const DietLog = require('./models/DietLog');
const WaterIntake = require('./models/WaterIntake');

const app = express();

// ─────────────────────────────────────────
// ✅ CORS (FIXED FOR VERCEL & RENDER)
// ─────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://fittrack-a0zu.onrender.com',
    'https://fittrack-brown-gamma.vercel.app'
  ],
  credentials: true,
}));

app.use(express.json());

// ─────────────────────────────────────────
// ✅ HEALTH CHECK
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Backend is LIVE 🚀');
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is LIVE 🚀' });
});

const mongoose = require("mongoose");

app.get("/api/db-check", async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const statusMap = {
      0: "Disconnected ❌",
      1: "Connected ✅",
      2: "Connecting ⏳",
      3: "Disconnecting ⚠️",
    };
    res.json({ dbState: statusMap[state] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// ✅ CONNECT DB
// ─────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────
// 🔐 AUTH ROUTES
// ─────────────────────────────────────────

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      height,
      weight,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _pw, ...userOut } = user.toObject();

    res.status(201).json({ token, user: userOut });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _pw, ...userOut } = user.toObject();

    res.json({ token, user: userOut });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// 👤 USER ROUTES
// ─────────────────────────────────────────

app.get('/api/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE USER (FIXED)
app.put('/api/user/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Make sure users can only update their own profile
    if (id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }
    
    // Remove sensitive fields that shouldn't be updated here
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;
    delete updates._id;
    delete updates.token;
    
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// 🏃 ACTIVITY ROUTES
// ─────────────────────────────────────────

app.post('/api/activity', auth, async (req, res) => {
  try {
    const activity = await Activity.create({
      user_id: req.user.id,
      ...req.body,
      date: req.body.date || today(),
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ACTIVITIES (FIXED)
app.get('/api/activity', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ user_id: req.user.id })
      .sort({ date: -1 })
      .limit(10);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// 🍽️ DIET ROUTES
// ─────────────────────────────────────────

app.post('/api/diet', auth, async (req, res) => {
  try {
    const diet = await DietLog.create({
      user_id: req.user.id,
      ...req.body,
      date: req.body.date || today(),
    });
    res.status(201).json(diet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/diet', auth, async (req, res) => {
  try {
    const data = await DietLog.find({ user_id: req.user.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// 💧 WATER ROUTES
// ─────────────────────────────────────────

app.post('/api/water', auth, async (req, res) => {
  try {
    const water = await WaterIntake.create({
      user_id: req.user.id,
      ...req.body,
      date: req.body.date || today(),
    });
    res.status(201).json(water);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET WATER WITH TOTAL (FIXED)
app.get('/api/water', auth, async (req, res) => {
  try {
    const currentDate = today();
    const waterRecords = await WaterIntake.find({ 
      user_id: req.user.id,
      date: currentDate
    });
    
    const totalWater = waterRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    
    res.json({ totalWater, records: waterRecords });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// 📅 DAILY LOG ROUTE (NEW)
// ─────────────────────────────────────────
app.get('/api/daily-log', auth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }
    
    // Get foods for that date
    const foods = await DietLog.find({ 
      user_id: req.user.id, 
      date: date 
    }).sort({ createdAt: -1 });
    
    // Get water for that date
    const waterRecords = await WaterIntake.find({ 
      user_id: req.user.id, 
      date: date 
    });
    const totalWater = waterRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    
    res.json({ foods, water: totalWater });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// 📊 REPORTS ROUTE (NEW)
// ─────────────────────────────────────────
app.get('/api/reports', auth, async (req, res) => {
  try {
    const reports = [];
    const today_date = new Date();
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today_date);
      date.setDate(today_date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Get foods for this date
      const foods = await DietLog.find({ 
        user_id: req.user.id, 
        date: dateString 
      });
      
      // Get water for this date
      const waterRecords = await WaterIntake.find({ 
        user_id: req.user.id, 
        date: dateString 
      });
      const totalWater = waterRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
      
      // Calculate total calories
      const totalCalories = foods.reduce((sum, food) => sum + (food.calories || 0), 0);
      
      reports.push({
        day: dayName,
        date: dateString,
        calories: totalCalories,
        water: totalWater,
        meal_count: foods.length
      });
    }
    
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// 👑 ADMIN ROUTES (NEW)
// ─────────────────────────────────────────
app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    // Get stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const mealCount = await DietLog.countDocuments({ user_id: user._id });
      const waterRecords = await WaterIntake.find({ user_id: user._id });
      const totalWater = waterRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
      
      return {
        ...user.toObject(),
        meal_count: mealCount,
        total_water: totalWater
      };
    }));
    
    res.json(usersWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMeals = await DietLog.countDocuments();
    const waterRecords = await WaterIntake.find();
    const totalWater = waterRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    
    // Active today (users who logged anything today)
    const currentDate = today();
    const activeUsersToday = await DietLog.distinct('user_id', { date: currentDate });
    const activeToday = activeUsersToday.length;
    
    res.json({
      totalUsers,
      totalMeals,
      totalWater,
      activeToday
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});