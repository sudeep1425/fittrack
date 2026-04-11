import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "./api/axios";
import toast from "react-hot-toast";
import { 
  Plus, 
  Droplets, 
  Utensils, 
  TrendingUp, 
  Sparkles,
  Search,
  Scale,
  PieChart as ChartIcon,
  Loader2,
  Info
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = ({ darkMode }) => {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState(0);
  const [water, setWater] = useState(0);
  const [newWater, setNewWater] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingCal, setFetchingCal] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  // UI State for visible dropdowns
  const [selectedCategory, setSelectedCategory] = useState("Meal");
  const [portionSize, setPortionSize] = useState("Medium");

  // Local Smart Dictionary for instant lookups without API
  const localFoodDict = {
    apple: 95, banana: 105, rice: 200, "brown rice": 215, "white rice": 205,
    chicken: 230, "chicken breast": 165, egg: 70, "boiled egg": 75,
    milk: 150, oats: 150, salad: 50, pizza: 285, burger: 350,
    chips: 150, fries: 365, "coca cola": 140, soda: 150, cake: 250,
    biscuit: 50, namkeen: 150, sweet: 200, curd: 100, yogurt: 100,
    avocado: 160, "avocado toast": 300, bread: 80, "whole wheat bread": 70,
    pasta: 200, fish: 200, steak: 270, dal: 150, chapati: 100, roti: 100
  };

  const fetchCalorieInfo = async () => {
    if (!foodName) {
      toast.error("What are you eating? Type it first!");
      return;
    }

    const query = foodName.toLowerCase().trim();
    
    // 1. Check Local Dictionary first (Instant & Free)
    if (localFoodDict[query]) {
      const baseCals = localFoodDict[query];
      const multiplier = portionSize === "Small" ? 0.7 : portionSize === "Large" ? 1.5 : 1;
      const finalCals = Math.round(baseCals * multiplier);
      setCalories(finalCals);
      toast.success(`Smart Lookup: ${finalCals} kcal`);
      return;
    }

    // 2. Try API (If configured)
    const NUTRITION_APP_ID = "c6b0f0f4"; 
    const NUTRITION_APP_KEY = "7e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e"; // Placeholder keys for demo

    if (NUTRITION_APP_ID && NUTRITION_APP_KEY && NUTRITION_APP_KEY !== "7e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e") {
      setFetchingCal(true);
      try {
        const response = await axios.post(
          "https://trackapi.nutritionix.com/v2/natural/nutrients",
          { query: `${portionSize} portion of ${foodName}` },
          {
            headers: {
              "x-app-id": NUTRITION_APP_ID,
              "x-app-key": NUTRITION_APP_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.foods && response.data.foods.length > 0) {
          const fetchedCals = Math.round(response.data.foods[0].nf_calories);
          setCalories(fetchedCals);
          toast.success(`Real-time: ${fetchedCals} kcal`);
          return;
        }
      } catch (err) {
        console.error("API Fetch failed, using estimates.");
      } finally {
        setFetchingCal(false);
      }
    }

    // 3. Fallback to Smart Estimates (Always works)
    const estimates = {
      Meal: { Small: 400, Medium: 650, Large: 900 },
      Snack: { Small: 100, Medium: 200, Large: 350 },
      Drink: { Small: 50, Medium: 150, Large: 300 },
      Fruit: { Small: 50, Medium: 100, Large: 150 },
    };
    const fallback = estimates[selectedCategory][portionSize];
    setCalories(fallback);
    toast.info(`Smart Estimate: ${fallback} kcal`);
  };

  // Daily Goals
  const [goals] = useState({
    calories: 2200,
    water: 3, // Liters
  });

  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  const token = user?.token;

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get(`/dashboard/${user.id}`);
      setFoods(response.data.diets || []);
      setWater(Number(response.data.totalWater) || 0);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const COLORS = ["#22c55e", "#f97316", "#ef4444"]; 

  const categorizeFood = (name) => {
    const healthy = ["rice", "salad", "milk", "eggs", "fruits", "oats", "chicken", "fish", "vegetables", "curd", "dal", "chapati", "roti", "avocado"];
    const junk = ["pizza", "burger", "chips", "fries", "coke", "soda", "cake", "biscuit", "namkeen", "sweet"];

    if (healthy.some(h => name.toLowerCase().includes(h))) return "Healthy";
    if (junk.some(j => name.toLowerCase().includes(j))) return "Junk";
    return "Moderate";
  };

  const getCoachVerdict = (currentFoods, totalWater) => {
    const junkCount = currentFoods.filter(f => categorizeFood(f.food_name) === "Junk").length;
    const healthyCount = currentFoods.filter(f => categorizeFood(f.food_name) === "Healthy").length;
    const totalCal = currentFoods.reduce((sum, f) => sum + Number(f.calories), 0);
    
    if (totalCal > goals.calories + 300) return "Coach Verdict: Exceeded calorie goal. Try some movement! 🌙";
    if (junkCount > 1) return "Coach Verdict: Too much processed food. Grab a fruit instead! 🍏";
    if (totalWater < 1 && totalCal > 500) return "Coach Verdict: You're dehydrated! Drink water now. 💧";
    if (healthyCount > 2) return "Coach Verdict: Incredible discipline! You're fueling perfectly. 🔥";
    return "Coach Verdict: You're doing okay! Keep tracking. ✨";
  };

  useEffect(() => {
    if (!loading) setSuggestion(getCoachVerdict(foods, water));
  }, [foods, water, loading]);

  const addFood = async () => {
    if (!foodName) {
      toast.error("What did you eat?");
      return;
    }

    try {
      const category = categorizeFood(foodName);
      const response = await api.post('/diet', {
        food_name: foodName,
        calories: Number(calories),
        meal_type: category
      });

      setFoods([response.data, ...foods]);
      setFoodName("");
      setCalories(0);
      toast.success(`${foodName} added!`);
    } catch (err) {
      toast.error("Failed to add food");
    }
  };

  const addWater = async () => {
    if (!newWater) return;
    try {
      await api.post('/water', { amount: Number(newWater) });
      setWater(prev => prev + Number(newWater));
      setNewWater("");
      toast.success("Water logged! 💧");
    } catch (err) {
      toast.error("Failed to add water");
    }
  };

  const stats = foods.reduce((acc, food) => {
    const cat = food.meal_type || categorizeFood(food.food_name);
    const cals = Number(food.calories);
    acc[cat] += cals;
    acc.total += cals;
    return acc;
  }, { Healthy: 0, Moderate: 0, Junk: 0, total: 0 });

  const chartData = [
    { name: "Healthy", value: stats.Healthy },
    { name: "Moderate", value: stats.Moderate },
    { name: "Junk", value: stats.Junk },
  ];

  const calorieScore = Math.max(0, 40 - Math.abs(stats.total - goals.calories) / 20);
  const qualityScore = stats.total > 0 ? (stats.Healthy / stats.total) * 30 : 15;
  const junkPenalty = (stats.Junk / (stats.total || 1)) * 20;
  const waterScore = Math.min(30, (water / goals.water) * 30);
  const finalScore = Math.round(Math.min(100, Math.max(0, calorieScore + qualityScore - junkPenalty + waterScore)));

  const cardClasses = darkMode 
    ? "bg-white/10 backdrop-blur-lg border-white/20 shadow-xl" 
    : "bg-white border-slate-200 shadow-md";

  const inputClasses = darkMode
    ? "bg-slate-800 text-white placeholder-slate-400 border-white/20"
    : "bg-slate-50 text-slate-900 border-slate-200";

  // Visible Dropdown classes
  const selectClasses = darkMode 
    ? "bg-slate-700 text-white border-white/10 hover:bg-slate-600" 
    : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50";

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="animate-spin text-purple-500" size={48} />
    </div>
  );

  return (
    <div className={darkMode ? "text-white" : "text-slate-900"}>
      <h1 className="text-3xl md:text-4xl font-black text-center mb-10 flex items-center justify-center gap-3">
        <Sparkles className="text-yellow-400" />
        Health Hub
      </h1>

      {suggestion && (
        <div className="mb-8 p-4 md:p-5 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 rounded-3xl flex items-center gap-4 animate-in fade-in duration-1000">
          <div className="p-2 md:p-3 bg-purple-500 rounded-2xl shadow-lg">
            <Sparkles className="text-white shrink-0" size={20} />
          </div>
          <p className="font-bold text-base md:text-lg leading-tight">{suggestion}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        <div className="space-y-6 md:space-y-8">
          
          <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border`}>
            <h2 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-2 uppercase tracking-widest opacity-60">
              <TrendingUp className="text-blue-400" />
              Daily Pulse
            </h2>
            
            <div className="space-y-6 md:space-y-8">
              <div>
                <div className="flex justify-between mb-2 md:mb-3 items-end">
                  <span className="text-base md:text-lg font-bold">Calories</span>
                  <span className="text-xs md:text-sm opacity-60">{stats.total} / {goals.calories} kcal</span>
                </div>
                <div className="w-full bg-slate-200/20 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full ${stats.total > goals.calories ? "bg-red-500" : "bg-gradient-to-r from-green-400 to-blue-500"}`}
                    style={{ width: `${Math.min(100, (stats.total / goals.calories) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2 md:mb-3 items-end">
                  <span className="text-base md:text-lg font-bold">Hydration</span>
                  <span className="text-xs md:text-sm opacity-60">{water} / {goals.water} Liters</span>
                </div>
                <div className="w-full bg-slate-200/20 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-600 h-full transition-all duration-1000 rounded-full"
                    style={{ width: `${Math.min(100, (water / goals.water) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border`}>
            <h2 className="text-lg md:text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-widest opacity-60">
              <Utensils className="text-green-400" />
              Log Nutrition
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search food..."
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className={`w-full p-4 pl-12 rounded-2xl border focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
                  />
                </div>
                <button 
                  onClick={fetchCalorieInfo}
                  disabled={fetchingCal}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-2xl shadow-lg transition-all flex items-center justify-center min-w-[50px] md:min-w-[60px]"
                >
                  {fetchingCal ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50 ml-1">Type</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full p-4 rounded-2xl border cursor-pointer focus:ring-2 focus:ring-purple-500 transition-all shadow-sm ${selectClasses}`}
                  >
                    <option value="Meal">Meal</option>
                    <option value="Snack">Snack</option>
                    <option value="Drink">Drink</option>
                    <option value="Fruit">Fruit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50 ml-1">Portion</label>
                  <select 
                    value={portionSize}
                    onChange={(e) => setPortionSize(e.target.value)}
                    className={`w-full p-4 rounded-2xl border cursor-pointer focus:ring-2 focus:ring-purple-500 transition-all shadow-sm ${selectClasses}`}
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase opacity-50">Calories</span>
                  <input 
                    type="number" 
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-2xl font-black text-purple-400 w-24"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold opacity-40 uppercase">kcal</span>
                </div>
              </div>

              <button
                onClick={addFood}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl font-black text-white shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus size={24} />
                Add Food
              </button>
            </div>
          </div>

          <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border`}>
            <h2 className="text-lg md:text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-widest opacity-60">
              <Droplets className="text-blue-400" />
              Quick Water Log
            </h2>

            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Liters"
                value={newWater}
                onChange={(e) => setNewWater(e.target.value)}
                className={`w-full p-4 rounded-2xl border focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
              />
              <button
                onClick={addWater}
                className="bg-blue-500 hover:bg-blue-600 px-6 md:px-10 rounded-2xl font-black text-white shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                Log
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className={`${cardClasses} p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border text-center relative overflow-hidden group`}>
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h2 className="text-lg md:text-xl font-black mb-6 md:mb-8 uppercase tracking-widest opacity-60">Wellness Score</h2>
            <div className={`w-36 h-36 md:w-48 md:h-48 mx-auto rounded-full border-[8px] md:border-[12px] ${finalScore > 70 ? "border-green-500 shadow-green-500/20" : finalScore > 40 ? "border-yellow-500 shadow-yellow-500/20" : "border-red-500 shadow-red-500/20"} flex items-center justify-center text-4xl md:text-6xl font-black shadow-2xl transition-all duration-1000 relative z-10`}>
              {finalScore}
            </div>
            <p className="mt-6 md:mt-8 text-xl md:text-2xl font-black relative z-10">
              {finalScore > 75 ? "Peak Performance! 🏆" : finalScore > 50 ? "Steadily Improving 📈" : "Need more focus 🎯"}
            </p>
          </div>

          <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border`}>
            <h2 className="text-lg md:text-xl font-black mb-6 flex items-center justify-center gap-2 uppercase tracking-widest opacity-60">
              <ChartIcon className="text-purple-400" />
              Calorie Quality
            </h2>
            <div className="w-full h-64 md:h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} dataKey="value" outerRadius={80} md:outerRadius={100} innerRadius={60} md:innerRadius={70} paddingAngle={8} label>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '20px', border: 'none' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border max-h-[26rem] overflow-y-auto custom-scrollbar`}>
            <h2 className="text-lg md:text-xl font-black mb-6 uppercase tracking-widest opacity-60">Today's Meals</h2>
            {foods.length === 0 ? (
              <div className="text-center py-12 md:py-16 opacity-30 italic">No meals logged for today</div>
            ) : (
              <div className="space-y-4">
                {foods.map((food, index) => (
                  <div key={index} className={`flex justify-between items-center p-4 md:p-5 rounded-[1.5rem] ${darkMode ? "bg-white/5" : "bg-slate-50"} border ${darkMode ? "border-white/5" : "border-slate-100"} transition-all hover:translate-x-1`}>
                    <div className="flex flex-col">
                      <span className="font-black text-base md:text-lg">{food.food_name}</span>
                      <span className="text-[10px] md:text-xs font-bold opacity-40 uppercase tracking-widest">{food.calories} kcal</span>
                    </div>
                    <span className={`px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-tighter ${food.meal_type === "Healthy" ? "bg-green-500/20 text-green-400" : food.meal_type === "Junk" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {food.meal_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
