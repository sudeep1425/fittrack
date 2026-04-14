import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CalendarDays, Droplets, UtensilsCrossed, Trash2, Plus, Loader2 } from 'lucide-react';
import { getEstimatedCalories, FOOD_CALORIES_PER_100G } from '../utils/calories';

export default function DailyLogPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [logData, setLogData] = useState({ foods: [], totalWater: 0 });
  const [loading, setLoading] = useState(true);
  const [foodForm, setFoodForm] = useState({ food_name: '', amount_grams: '', meal_type: 'Breakfast' });
  const [waterForm, setWaterForm] = useState({ amount: '' });
  const [addingFood, setAddingFood] = useState(false);
  const [addingWater, setAddingWater] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLog = async (d) => {
    try {
      setLoading(true);
      const res = await api.get(`/daily-log?date=${d}`);
      setLogData(res.data || { foods: [], totalWater: 0 });
    } catch (err) {
      console.error("Error fetching log:", err);
      toast.error('Failed to load log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLog(date); }, [date]);

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
      await api.post('/diet', {
        ...foodForm,
        amount_grams: Number(foodForm.amount_grams),
        calories: estimatedCalories,
        date,
      });
      toast.success('Food logged!');
      setFoodForm({ food_name: '', amount_grams: '', meal_type: 'Breakfast' });
      fetchLog(date);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add food');
    } finally {
      setAddingFood(false);
    }
  };

  const handleAddWater = async (e) => {
    e.preventDefault();
    if (!waterForm.amount) return toast.error('Amount is required');
    setAddingWater(true);
    try {
      await api.post('/water', { amount: Number(waterForm.amount), date });
      toast.success('Water logged!');
      setWaterForm({ amount: '' });
      fetchLog(date);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add water');
    } finally {
      setAddingWater(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/diet/${id}`);
      toast.success('Entry deleted');
      fetchLog(date);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass = "bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all w-full";
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const mealColors = { Breakfast: 'text-yellow-400', Lunch: 'text-green-400', Dinner: 'text-purple-400', Snack: 'text-pink-400' };

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CalendarDays className="text-indigo-400" size={24} /> Daily Log
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track your nutrition day by day</p>
          </div>
          <input
            type="date" value={date} max={todayStr}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          />
        </div>

        {/* Water Summary */}
        <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-700/30 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Droplets className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-blue-300 text-sm font-medium">Total Water</p>
            <p className="text-white text-2xl font-bold">{logData.totalWater} <span className="text-slate-400 text-sm font-normal">ml</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Add Food */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-indigo-400" /> Add Food
            </h3>
            <form onSubmit={handleAddFood} className="space-y-3">
              <input
                list="food-suggestions"
                value={foodForm.food_name}
                onChange={(e) => setFoodForm({ ...foodForm, food_name: e.target.value })}
                placeholder="Food name (e.g., rice)"
                className={inputClass}
              />
              <datalist id="food-suggestions">
                {Object.keys(FOOD_CALORIES_PER_100G).map((food) => (
                  <option key={food} value={food} />
                ))}
              </datalist>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={foodForm.amount_grams}
                  onChange={(e) => setFoodForm({ ...foodForm, amount_grams: e.target.value })}
                  placeholder="Amount (grams)"
                  className={inputClass}
                />
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

          {/* Add Water */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Droplets size={18} className="text-blue-400" /> Add Water
            </h3>
            <form onSubmit={handleAddWater} className="space-y-3">
              <input type="number" value={waterForm.amount} onChange={(e) => setWaterForm({ amount: e.target.value })} placeholder="Amount in ml" className={inputClass} />
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

        {/* Food List */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">
            Food Entries — <span className="text-slate-400 text-sm font-normal">{logData.foods.length} item{logData.foods.length !== 1 ? 's' : ''}</span>
          </h3>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="text-indigo-400 animate-spin" size={24} /></div>
          ) : logData.foods.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">No food logged for this date 🍽️</p>
          ) : (
            <div className="space-y-2">
              {logData.foods.map((f) => (
                <div key={f._id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/30 group hover:border-slate-600/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">{f.food_name}</span>
                      <span className={`text-xs font-medium ${mealColors[f.meal_type] || 'text-slate-400'}`}>
                        {f.meal_type}{f.amount_grams ? ` • ${f.amount_grams} g` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-semibold text-sm">{f.calories} kcal</span>
                    <button
                      onClick={() => handleDelete(f._id)}
                      disabled={deletingId === f._id}
                      className="text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {deletingId === f._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                <span className="text-slate-400 text-sm">Total Calories</span>
                <span className="text-orange-400 font-bold">
                  {logData.foods.reduce((s, f) => s + f.calories, 0)} kcal
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
