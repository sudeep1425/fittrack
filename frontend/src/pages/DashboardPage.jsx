import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Flame, Droplets, Plus, UtensilsCrossed, Loader2,
  Settings2, Lightbulb, X, Check, ChevronDown,
} from 'lucide-react';
import { getEstimatedCalories, FOOD_CALORIES_PER_100G } from '../utils/calories';

// ─── Smart suggestions engine ─────────────────────────────────────────────────
function computeSuggestions(profile) {
  const suggestions = [];
  const { age, gender, height, weight } = profile || {};

  if (!weight || !height) return suggestions;

  const isMale   = gender === 'Male';
  const isFemale = gender === 'Female';
  const w = Number(weight), h = Number(height), a = Number(age) || 30;

  // Harris-Benedict BMR
  const bmr = isMale
    ? 88.36 + 13.4 * w + 4.8 * h - 5.7 * a
    : isFemale
    ? 447.6 + 9.2 * w + 3.1 * h - 4.3 * a
    : 500 + 10 * w + 6.25 * h - 5 * a;

  const bmi = w / ((h / 100) ** 2);

  suggestions.push({
    label: 'Sedentary',
    desc: 'Little or no exercise',
    cal: Math.round(bmr * 1.2),
    water: Math.round(w * 30),
    tag: 'Maintenance',
    color: '#818cf8',
  });
  suggestions.push({
    label: 'Lightly Active',
    desc: 'Exercise 1-3 days/week',
    cal: Math.round(bmr * 1.375),
    water: Math.round(w * 35),
    tag: 'Recommended',
    color: '#34d399',
  });
  suggestions.push({
    label: 'Moderately Active',
    desc: 'Exercise 3-5 days/week',
    cal: Math.round(bmr * 1.55),
    water: Math.round(w * 40),
    tag: 'Active',
    color: '#fbbf24',
  });
  suggestions.push({
    label: 'Very Active',
    desc: 'Hard exercise 6-7 days/week',
    cal: Math.round(bmr * 1.725),
    water: Math.round(w * 45),
    tag: 'Athletic',
    color: '#f87171',
  });

  // Add weight-loss variant if overweight
  if (bmi > 25) {
    suggestions.push({
      label: 'Weight Loss',
      desc: 'Calorie deficit for fat loss',
      cal: Math.round(bmr * 1.375 * 0.8),
      water: Math.round(w * 38),
      tag: 'Fat Loss',
      color: '#e879f9',
    });
  }

  return suggestions;
}

// ─── Goals Modal ──────────────────────────────────────────────────────────────
function GoalsModal({ profile, currentCal, currentWater, onSave, onClose }) {
  const [cal,   setCal]   = useState(currentCal);
  const [water, setWater] = useState(currentWater);
  const [saving, setSaving] = useState(false);
  const suggestions = computeSuggestions(profile);
  const hasProfile = profile?.weight && profile?.height;

  const handleSave = async () => {
    setSaving(true);
    await onSave(cal, water);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Settings2 size={16} className="text-indigo-400" />
            </div>
            <h2 className="text-white font-bold">Goal Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Calorie Goal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 text-sm font-semibold flex items-center gap-2">
                <Flame size={15} className="text-orange-400" /> Daily Calorie Goal
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={cal}
                  min={800} max={5000} step={50}
                  onChange={(e) => setCal(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-600 text-orange-400 font-bold rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-orange-500"
                />
                <span className="text-slate-500 text-xs">kcal</span>
              </div>
            </div>
            <input
              type="range"
              min={800} max={5000} step={50}
              value={cal}
              onChange={(e) => setCal(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#f97316' }}
            />
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>800</span><span>1500</span><span>2000</span><span>3000</span><span>5000</span>
            </div>
          </div>

          {/* Water Goal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 text-sm font-semibold flex items-center gap-2">
                <Droplets size={15} className="text-blue-400" /> Daily Water Goal
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={water}
                  min={500} max={6000} step={100}
                  onChange={(e) => setWater(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-600 text-blue-400 font-bold rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-500 text-xs">ml</span>
              </div>
            </div>
            <input
              type="range"
              min={500} max={6000} step={100}
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#60a5fa' }}
            />
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>500</span><span>1500</span><span>3000</span><span>4500</span><span>6000</span>
            </div>
          </div>

          {/* Smart Suggestions */}
          {hasProfile ? (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <Lightbulb size={13} className="text-yellow-400" />
                Smart Suggestions — based on your profile
              </p>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => { setCal(s.cal); setWater(s.water); }}
                    className="w-full text-left p-3.5 bg-slate-900/80 hover:bg-slate-700/60 border border-slate-700 hover:border-slate-500 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-semibold">{s.label}</span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: s.color + '22', color: s.color }}
                            >{s.tag}</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-orange-400 text-xs font-bold">{s.cal.toLocaleString()} kcal</p>
                        <p className="text-blue-400 text-xs font-bold">{s.water.toLocaleString()} ml</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 text-sm font-medium">Enable Smart Suggestions</p>
                <p className="text-slate-400 text-xs mt-1">Add your height, weight, age, and gender in <span className="text-indigo-400 font-medium">Profile</span> to unlock personalised goal suggestions based on your body and activity level.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-700 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} /> Apply Goals</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DEFAULT_CAL   = 2000;
const DEFAULT_WATER = 3000;

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [data, setData]           = useState({ diets: [], totalWater: 0, totalCalories: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [profile, setProfile]     = useState(null);

  const [calorieGoal, setCalorieGoal] = useState(user?.calorieGoal || DEFAULT_CAL);
  const [waterGoal,   setWaterGoal]   = useState(user?.waterGoal   || DEFAULT_WATER);
  const [showGoals,   setShowGoals]   = useState(false);

  const [foodForm, setFoodForm]   = useState({ food_name: '', amount_grams: '', meal_type: 'Breakfast' });
  const [waterForm, setWaterForm] = useState({ amount: '' });
  const [addingFood,  setAddingFood]  = useState(false);
  const [addingWater, setAddingWater] = useState(false);

  // Load dashboard data
  const fetchData = async () => {
    try {
      setLoadingData(true);
      const res = await api.get(`/dashboard/${user._id}`);
      setData(res.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoadingData(false);
    }
  };

  // Load profile for suggestions
  const fetchProfile = async () => {
    try {
      const res = await api.get(`/user/${user._id}`);
      setProfile(res.data);
      if (res.data.calorieGoal) setCalorieGoal(res.data.calorieGoal);
      if (res.data.waterGoal)   setWaterGoal(res.data.waterGoal);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchData(); fetchProfile(); }, []);

  const estimation = getEstimatedCalories(foodForm.food_name, foodForm.amount_grams);
  const estimatedCalories = estimation.cal;

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!foodForm.food_name || !foodForm.amount_grams) return toast.error('Food name and amount are required');
    if (!estimatedCalories) {
      return toast.error('Could not auto-calculate calories. Please use a recognizable food name (e.g. rice, chicken, apple).');
    }
    setAddingFood(true);
    try {
      await api.post('/diet', { ...foodForm, amount_grams: Number(foodForm.amount_grams), calories: estimatedCalories });
      toast.success('Food logged!');
      setFoodForm({ food_name: '', amount_grams: '', meal_type: 'Breakfast' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log food');
    } finally { setAddingFood(false); }
  };

  const handleAddWater = async (e) => {
    e.preventDefault();
    if (!waterForm.amount) return toast.error('Amount is required');
    setAddingWater(true);
    try {
      await api.post('/water', { amount: Number(waterForm.amount) });
      toast.success('Water logged!');
      setWaterForm({ amount: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log water');
    } finally { setAddingWater(false); }
  };

  const handleSaveGoals = async (cal, water) => {
    try {
      const res = await api.patch(`/user/${user._id}/goals`, { calorieGoal: cal, waterGoal: water });
      setCalorieGoal(cal);
      setWaterGoal(water);
      updateUser({ ...user, calorieGoal: cal, waterGoal: water });
      setShowGoals(false);
      toast.success('Goals updated! 🎯');
    } catch {
      toast.error('Failed to save goals');
    }
  };

  const caloriesPct = Math.min((data.totalCalories / calorieGoal) * 100, 100);
  const waterPct    = Math.min((data.totalWater    / waterGoal)   * 100, 100);

  const chartData = data.diets.map((d) => ({
    name: d.food_name.length > 10 ? d.food_name.slice(0, 10) + '…' : d.food_name,
    calories: d.calories,
  }));

  const inputClass = "bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all w-full";
  const mealTypes  = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const greet      = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good {greet},{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {user?.name?.split(' ')[0]}
              </span>{' '}👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Goal Settings trigger */}
          <button
            onClick={() => setShowGoals(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all"
          >
            <Settings2 size={15} className="text-indigo-400" />
            Modify Goals
            <ChevronDown size={13} className="text-slate-500" />
          </button>
        </div>

        {/* Goals banner */}
        <div className="mb-6 flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-2.5 text-xs text-slate-400 flex-wrap">
          <span className="font-medium text-slate-300">Today's Targets:</span>
          <span className="flex items-center gap-1.5">
            <Flame size={12} className="text-orange-400" />
            <span className="text-orange-400 font-bold">{calorieGoal.toLocaleString()}</span> kcal
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <Droplets size={12} className="text-blue-400" />
            <span className="text-blue-400 font-bold">{waterGoal.toLocaleString()}</span> ml
          </span>
          <button
            onClick={() => setShowGoals(true)}
            className="ml-auto text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Edit →
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="text-indigo-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Calories */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Flame size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Calories Today</h3>
                    <p className="text-slate-400 text-xs">Goal: {calorieGoal.toLocaleString()} kcal</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-28 h-28 flex-shrink-0">
                    <CircularProgressbar
                      value={caloriesPct}
                      text={`${Math.round(caloriesPct)}%`}
                      styles={buildStyles({ textColor: '#f97316', pathColor: '#f97316', trailColor: '#1e293b', textSize: '20px' })}
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-orange-400">{data.totalCalories}</p>
                    <p className="text-slate-400 text-sm">kcal consumed</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {Math.max(0, calorieGoal - data.totalCalories).toLocaleString()} kcal remaining
                    </p>
                    {data.totalCalories > calorieGoal && (
                      <p className="text-red-400 text-xs mt-1 font-medium">⚠ Goal exceeded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Water */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Droplets size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Water Intake</h3>
                    <p className="text-slate-400 text-xs">Goal: {waterGoal.toLocaleString()} ml</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-28 h-28 flex-shrink-0">
                    <CircularProgressbar
                      value={waterPct}
                      text={`${Math.round(waterPct)}%`}
                      styles={buildStyles({ textColor: '#60a5fa', pathColor: '#60a5fa', trailColor: '#1e293b', textSize: '20px' })}
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-400">{data.totalWater}</p>
                    <p className="text-slate-400 text-sm">ml consumed</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {Math.max(0, waterGoal - data.totalWater).toLocaleString()} ml remaining
                    </p>
                    {data.totalWater > waterGoal && (
                      <p className="text-blue-300 text-xs mt-1 font-medium">✓ Goal achieved!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Log + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Log Food */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <UtensilsCrossed size={18} className="text-indigo-400" /> Log Food
                </h3>
                <form onSubmit={handleAddFood} className="space-y-3">
                  <input list="dash-food-suggestions" value={foodForm.food_name} onChange={(e) => setFoodForm({ ...foodForm, food_name: e.target.value })} placeholder="Food name" className={inputClass} />
                  <datalist id="dash-food-suggestions">
                    {Object.keys(FOOD_CALORIES_PER_100G).map((f) => <option key={f} value={f} />)}
                  </datalist>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={foodForm.amount_grams} onChange={(e) => setFoodForm({ ...foodForm, amount_grams: e.target.value })} placeholder="Amount (grams)" className={inputClass} />
                    <select value={foodForm.meal_type} onChange={(e) => setFoodForm({ ...foodForm, meal_type: e.target.value })} className={inputClass + ' cursor-pointer'}>
                      {mealTypes.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50">
                    <p className="text-sm font-medium text-slate-300 flex items-center justify-between">
                      Auto-Calculated Calories:
                      <span className="text-orange-400 font-bold text-lg">{estimatedCalories || 0} kcal</span>
                    </p>
                    {estimation.per100 > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        Based on {estimation.per100} kcal per 100g (matched with: <span className="capitalize text-slate-300 font-medium">{estimation.matched}</span>)
                      </p>
                    )}
                  </div>
                  <button disabled={addingFood} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                    {addingFood ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add Food</>}
                  </button>
                </form>
              </div>

              {/* Log Water */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Droplets size={18} className="text-blue-400" /> Log Water
                </h3>
                <form onSubmit={handleAddWater} className="space-y-3">
                  <input type="number" value={waterForm.amount} onChange={(e) => setWaterForm({ amount: e.target.value })} placeholder="Amount in ml (e.g. 250)" className={inputClass} />
                  <div className="grid grid-cols-3 gap-2">
                    {[150, 250, 500].map((ml) => (
                      <button key={ml} type="button" onClick={() => setWaterForm({ amount: String(ml) })}
                        className="bg-slate-700 hover:bg-blue-600/30 border border-slate-600 hover:border-blue-500/50 text-slate-300 hover:text-blue-300 rounded-xl py-2 text-sm transition-all">
                        {ml} ml
                      </button>
                    ))}
                  </div>
                  <button disabled={addingWater} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                    {addingWater ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add Water</>}
                  </button>
                </form>
              </div>
            </div>

            {/* Meals Chart */}
            {chartData.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-8">
                <h3 className="text-white font-semibold mb-4">Today's Meals (kcal)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
                    <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={`hsl(${230 + i * 20}, 70%, 60%)`} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Food Log */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Today's Food Log</h3>
              {data.diets.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No food logged today. Add your first meal! 🍽️</p>
              ) : (
                <div className="space-y-2">
                  {data.diets.map((d) => (
                    <div key={d._id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                      <div>
                        <p className="text-white text-sm font-medium">{d.food_name}</p>
                        <p className="text-slate-500 text-xs">{d.meal_type}</p>
                      </div>
                      <span className="text-orange-400 text-sm font-semibold">{d.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Goals Modal */}
      {showGoals && (
        <GoalsModal
          profile={profile}
          currentCal={calorieGoal}
          currentWater={waterGoal}
          onSave={handleSaveGoals}
          onClose={() => setShowGoals(false)}
        />
      )}
    </div>
  );
}
