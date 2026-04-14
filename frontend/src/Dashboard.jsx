import React, { useState, useEffect } from "react";
import api from "./api/axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState(0);
  const [water, setWater] = useState(0);
  const [newWater, setNewWater] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [activityRes, waterRes] = await Promise.all([
          api.get("/activity"),
          api.get("/water")
        ]);
        setFoods(activityRes.data || []);
        setWater(Number(waterRes.data?.totalWater) || 0);
      } catch (err) {
        console.error("Dashboard error:", err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array

  const addFood = async () => {
    if (!foodName) return;

    try {
      const res = await api.post("/diet", {
        food_name: foodName,
        calories: Number(calories),
        meal_type: "Meal"
      });

      setFoods([res.data, ...foods]);
      setFoodName("");
      setCalories(0);
      toast.success("Food added successfully!");
    } catch {
      toast.error("Failed to add food");
    }
  };

  const addWater = async () => {
    if (!newWater) return;

    try {
      await api.post("/water", { amount: Number(newWater) });
      setWater(prev => prev + Number(newWater));
      setNewWater("");
      toast.success("Water added successfully!");
    } catch {
      toast.error("Failed to add water");
    }
  };

  if (loading) {
    return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <input value={foodName} onChange={(e) => setFoodName(e.target.value)} />
      <input value={calories} onChange={(e) => setCalories(e.target.value)} />

      <button onClick={addFood}>Add Food</button>

      <input value={newWater} onChange={(e) => setNewWater(e.target.value)} />
      <button onClick={addWater}>Add Water</button>

      <h2>Water: {water}L</h2>

      {foods.map((f, i) => (
        <div key={i}>{f.food_name} - {f.calories} cal</div>
      ))}
    </div>
  );
};

export default Dashboard;