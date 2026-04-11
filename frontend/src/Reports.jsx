import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import api from "./api/axios";
import { TrendingUp, Activity, Droplets, Loader2 } from "lucide-react";

const Reports = ({ darkMode }) => {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await api.get('/reports');
        setHealthData(response.data);
      } catch (err) {
        console.error("Error fetching trends:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [token]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-purple-500" size={48} />
    </div>
  );

  // Calculate averages
  const avgWater = healthData.length > 0 ? (healthData.reduce((sum, d) => sum + d.water, 0) / healthData.length).toFixed(2) : 0;
  const avgCal = healthData.length > 0 ? Math.round(healthData.reduce((sum, d) => sum + d.calories, 0) / healthData.length) : 0;

  const cardClasses = darkMode 
    ? "bg-white/10 backdrop-blur-lg border-white/20 shadow-xl" 
    : "bg-white border-slate-200 shadow-md";

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-3xl md:text-4xl font-black mb-6 md:mb-8">Health Insights</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border flex items-center gap-4 md:gap-6`}>
          <div className="p-4 md:p-5 bg-blue-500/20 rounded-2xl text-blue-400">
            <Droplets size={28} />
          </div>
          <div>
            <p className="text-xs md:text-sm opacity-60 font-bold uppercase tracking-widest">Avg. Hydration</p>
            <p className="text-2xl md:text-3xl font-black">{avgWater}L</p>
          </div>
        </div>
        <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border flex items-center gap-4 md:gap-6`}>
          <div className="p-4 md:p-5 bg-green-500/20 rounded-2xl text-green-400">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-xs md:text-sm opacity-60 font-bold uppercase tracking-widest">Avg. Intake</p>
            <p className="text-2xl md:text-3xl font-black">{avgCal} kcal</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        
        {/* Water Intake Bar Chart */}
        <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border`}>
          <h2 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 uppercase tracking-widest opacity-60">
            <TrendingUp className="text-blue-400" size={20} />
            Water Consumption (L)
          </h2>
          <div className="w-full h-64 md:h-80">

            <ResponsiveContainer>
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1e293b' : '#fff', 
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="water" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calorie Intake Area Chart */}
        <div className={`${cardClasses} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border`}>
          <h2 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 uppercase tracking-widest opacity-60">
            <Activity className="text-green-400" size={20} />
            Calorie Intake Trend
          </h2>
          <div className="w-full h-64 md:h-80">

            <ResponsiveContainer>
              <AreaChart data={healthData}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1e293b' : '#fff', 
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area type="monotone" dataKey="calories" stroke="#22c55e" fillOpacity={1} fill="url(#colorCal)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
