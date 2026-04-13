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
// ✅ CORS (FIXED FOR VERCEL)
// ─────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
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

app.get('/api/activity', auth, async (req, res) => {
  try {
    const data = await Activity.find({ user_id: req.user.id });
    res.json(data);
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

app.get('/api/water', auth, async (req, res) => {
  try {
    const data = await WaterIntake.find({ user_id: req.user.id });
    res.json(data);
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