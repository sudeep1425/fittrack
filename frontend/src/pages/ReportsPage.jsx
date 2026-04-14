import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Flame, Droplets, Loader2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/reports');
        const reportData = Array.isArray(res.data) ? res.data : [];
        setData(reportData.map((d) => ({ ...d, date: d.date.slice(5) })));
      } catch (err) {
        console.error('Reports error:', err);
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalCal = data.reduce((s, d) => s + d.calories, 0);
  const totalWater = data.reduce((s, d) => s + d.water, 0);
  const avgCal = data.length ? Math.round(totalCal / data.length) : 0;
  const avgWater = data.length ? Math.round(totalWater / data.length) : 0;

  const statCards = [
    { label: 'Avg Daily Calories', value: `${avgCal} kcal`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Avg Daily Water', value: `${avgWater} ml`, icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Calories (7d)', value: `${totalCal} kcal`, icon: Flame, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Water (7d)', value: `${totalWater} ml`, icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-indigo-400" size={24} /> Weekly Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your health trends over the last 7 days</p>
        </div>

        {loading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="text-indigo-400 animate-spin" size={32} />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statCards.map(({ label, value, icon, color, bg }) => (
                <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    {icon && icon({ size: 18, className: color })}
                  </div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Calories Chart */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Flame size={18} className="text-orange-400" /> Daily Calories
              </h3>
              <p className="text-slate-500 text-xs mb-5">Calories consumed per day</p>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="calories" name="Calories (kcal)" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Water Chart */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Droplets size={18} className="text-blue-400" /> Daily Water Intake
              </h3>
              <p className="text-slate-500 text-xs mb-5">Water consumed per day (ml)</p>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Line
                    type="monotone" dataKey="water" name="Water (ml)"
                    stroke="#60a5fa" strokeWidth={2.5} dot={{ fill: '#60a5fa', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
