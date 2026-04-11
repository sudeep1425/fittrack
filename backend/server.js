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

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://fittrack-brown-gamma.vercel.app'],
  credentials: true,
}));
app.use(express.json());

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

// ── Helper ────────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const FOOD_CALORIES_PER_100G = {
  rice: 130,
  roti: 297,
  chapati: 297,
  idli: 146,
  dosa: 168,
  upma: 160,
  poha: 130,
  dal: 116,
  chicken: 239,
  egg: 155,
  paneer: 265,
  potato: 77,
  banana: 89,
  apple: 52,
  milk: 61,
  curd: 98,
  oats: 389,
};

function caloriesForFood(foodName, amountGrams) {
  const key = String(foodName || '').trim().toLowerCase();
  const per100 = FOOD_CALORIES_PER_100G[key];
  if (!per100 || !Number.isFinite(amountGrams) || amountGrams <= 0) return 0;
  return Math.round((per100 * amountGrams) / 100);
}

// ═════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, age, gender, height, weight });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _pw, ...userOut } = user.toObject();

    res.status(201).json({ token, user: userOut });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _pw, ...userOut } = user.toObject();

    res.json({ token, user: userOut });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forgot-password
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// USER ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/user/:id
app.get('/api/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const activeDaysDiet = await DietLog.distinct('date', { user_id: req.params.id });
    const activeDaysWater = await WaterIntake.distinct('date', { user_id: req.params.id });
    const allActiveDates = [...new Set([...activeDaysDiet, ...activeDaysWater])].sort();

    const userObj = user.toObject();
    userObj.totalActiveDays = allActiveDates.length;
    userObj.lastActiveDate = allActiveDates.length > 0 ? allActiveDates[allActiveDates.length - 1] : null;

    res.json(userObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/user/:id
app.put('/api/user/:id', auth, async (req, res) => {
  try {
    const { name, email, age, gender, height, weight } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age, gender, height, weight },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/user/:id/goals
app.patch('/api/user/:id/goals', auth, async (req, res) => {
  try {
    const { calorieGoal, waterGoal } = req.body;
    const update = {};
    if (calorieGoal !== undefined) update.calorieGoal = Number(calorieGoal);
    if (waterGoal   !== undefined) update.waterGoal   = Number(waterGoal);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// ACTIVITY ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/activity
app.post('/api/activity', auth, async (req, res) => {
  try {
    const { steps, calories_burned, activity_type, date } = req.body;
    const activity = await Activity.create({
      user_id: req.user.id,
      steps,
      calories_burned,
      activity_type,
      date: date || today(),
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/activity
app.get('/api/activity', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// DIET ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/diet
app.post('/api/diet', auth, async (req, res) => {
  try {
    const { food_name, calories, amount_grams, meal_type, date } = req.body;
    const grams = Number(amount_grams);
    const incomingCalories = Number(calories);
    const computedCalories = caloriesForFood(food_name, grams);
    const finalCalories = Number.isFinite(incomingCalories) && incomingCalories > 0
      ? incomingCalories
      : computedCalories;

    const diet = await DietLog.create({
      user_id: req.user.id,
      food_name,
      amount_grams: Number.isFinite(grams) && grams > 0 ? grams : 100,
      calories: finalCalories,
      meal_type,
      date: date || today(),
    });
    res.status(201).json(diet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/diet
app.get('/api/diet', auth, async (req, res) => {
  try {
    const diets = await DietLog.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.json(diets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/diet/:id
app.delete('/api/diet/:id', auth, async (req, res) => {
  try {
    await DietLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Diet entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// WATER ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/water
app.post('/api/water', auth, async (req, res) => {
  try {
    const { amount, date } = req.body;
    const water = await WaterIntake.create({
      user_id: req.user.id,
      amount,
      date: date || today(),
    });
    res.status(201).json(water);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/water
app.get('/api/water', auth, async (req, res) => {
  try {
    const waters = await WaterIntake.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.json(waters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD ROUTE
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/dashboard/:userId
app.get('/api/dashboard/:userId', auth, async (req, res) => {
  try {
    const todayStr = today();
    const diets = await DietLog.find({ user_id: req.params.userId, date: todayStr });
    const waters = await WaterIntake.find({ user_id: req.params.userId, date: todayStr });
    const totalWater = waters.reduce((sum, w) => sum + w.amount, 0);
    const totalCalories = diets.reduce((sum, d) => sum + d.calories, 0);
    res.json({ diets, totalWater, totalCalories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// DAILY LOG ROUTE
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/daily-log?date=YYYY-MM-DD
app.get('/api/daily-log', auth, async (req, res) => {
  try {
    const dateStr = req.query.date || today();
    const foods = await DietLog.find({ user_id: req.user.id, date: dateStr }).sort({ createdAt: -1 });
    const waters = await WaterIntake.find({ user_id: req.user.id, date: dateStr });
    const totalWater = waters.reduce((sum, w) => sum + w.amount, 0);
    res.json({ foods, totalWater });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// REPORTS ROUTE
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/reports
app.get('/api/reports', auth, async (req, res) => {
  try {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const result = await Promise.all(
      last7Days.map(async (day) => {
        const diets = await DietLog.find({ user_id: req.user.id, date: day });
        const waters = await WaterIntake.find({ user_id: req.user.id, date: day });
        const calories = diets.reduce((s, d) => s + d.calories, 0);
        const water = waters.reduce((s, w) => s + w.amount, 0);
        return { date: day, calories, water };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// ACTIVITY STATS ROUTE
// ═════════════════════════════════════════════════════════════════════════════

app.get('/api/activity-stats', auth, async (req, res) => {
  try {
    const diets = await DietLog.find({ user_id: req.user.id });
    const waters = await WaterIntake.find({ user_id: req.user.id });

    const dateMap = {};
    for (const d of diets) {
      if (!dateMap[d.date]) dateMap[d.date] = { date: d.date, calories: 0, water: 0, meals: 0 };
      dateMap[d.date].calories += d.calories;
      dateMap[d.date].meals += 1;
    }
    for (const w of waters) {
      if (!dateMap[w.date]) dateMap[w.date] = { date: w.date, calories: 0, water: 0, meals: 0 };
      dateMap[w.date].water += w.amount;
    }

    const allRecords = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));
    const allDatesArr = allRecords.map(r => r.date);
    const allDates = new Set(allDatesArr);

    let streak = 0;
    const t = new Date();
    const todayStr = t.toISOString().split('T')[0];
    
    t.setDate(t.getDate() - 1);
    const yesterdayStr = t.toISOString().split('T')[0];

    if (allDates.has(todayStr) || allDates.has(yesterdayStr)) {
      let iterDate = new Date();
      if (!allDates.has(todayStr)) {
        iterDate.setDate(iterDate.getDate() - 1);
      }
      
      while (true) {
        const iterStr = iterDate.toISOString().split('T')[0];
        if (allDates.has(iterStr)) {
          streak++;
          iterDate.setDate(iterDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    res.json({
      totalActiveDays: allDates.size,
      currentStreak: streak,
      lastActiveDate: allDatesArr.length > 0 ? allDatesArr[0] : null,
      records: allRecords
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/admin/users
app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    const result = await Promise.all(
      users.map(async (user) => {
        const meal_count = await DietLog.countDocuments({ user_id: user._id });
        const waters = await WaterIntake.find({ user_id: user._id });
        const total_water = waters.reduce((s, w) => s + w.amount, 0);
        return { ...user.toObject(), meal_count, total_water };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats
app.get('/api/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMeals = await DietLog.countDocuments();
    const allWater = await WaterIntake.find();
    const totalWater = allWater.reduce((s, w) => s + w.amount, 0);
    const activeTodayIds = await DietLog.distinct('user_id', { date: today() });
    const activeToday = activeTodayIds.length;
    res.json({ totalUsers, totalMeals, totalWater, activeToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ──────────────────────────────────────────────────────────────────────
const BASE_PORT = Number(process.env.PORT) || 5000;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is busy, trying ${nextPort}...`);
      setTimeout(() => startServer(nextPort), 150);
      return;
    }
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  });
}

startServer(BASE_PORT);
