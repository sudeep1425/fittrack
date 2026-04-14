import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Activity, Flame, Calendar, Trophy, Loader2 } from 'lucide-react';

export default function ActivityStatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/activity-stats');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await api.get('/activity-stats');
      setData(res.data);
    } catch (err) {
      console.error('Activity stats error:', err);
      // Set mock data while endpoint is being developed
      setData({
        currentStreak: 0,
        totalActiveDays: 0,
        lastActiveDate: null,
        records: []
      });
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center pt-20">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-indigo-400" size={24} /> Activity Records
          </h1>
          <p className="text-slate-400 text-sm mt-1">Track your streaks, active days, and historical log data</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <Flame className="text-orange-500/20 absolute -right-4 -bottom-4 w-32 h-32" />
            <div className="relative z-10 flex flex-col items-center">
              <Trophy size={28} className="text-orange-400 mb-2" />
              <p className="text-4xl font-black text-orange-400 drop-shadow-md">{data?.currentStreak || 0}</p>
              <p className="text-orange-200 text-sm font-semibold mt-1 uppercase tracking-widest">Day Streak</p>
            </div>
          </div>

          {/* Active Days Card */}
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <Calendar className="text-indigo-500/20 absolute -right-4 -bottom-4 w-32 h-32" />
            <div className="relative z-10 flex flex-col items-center">
              <Activity size={28} className="text-indigo-400 mb-2" />
              <p className="text-4xl font-black text-indigo-400 drop-shadow-md">{data?.totalActiveDays || 0}</p>
              <p className="text-indigo-200 text-sm font-semibold mt-1 uppercase tracking-widest">Total Active Days</p>
            </div>
          </div>

          {/* Last Active Card */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center">
            <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Last Logged Activity</p>
            <p className="text-xl font-bold text-white text-center">
              {data?.lastActiveDate 
                ? new Date(data.lastActiveDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                : 'No activity yet'}
            </p>
          </div>
        </div>

        {/* Detailed Timeline Table */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/40">
            <h3 className="text-white font-semibold">Activity Timeline History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-orange-400">Calories Logged</th>
                  <th className="px-6 py-4 font-semibold text-blue-400">Water Logged</th>
                  <th className="px-6 py-4 font-semibold">Meals Entered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {!data?.records || data.records.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 text-sm">
                      No activity records found. Start logging meals or water to see them here!
                    </td>
                  </tr>
                ) : (
                  data.records.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 text-white font-medium whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        <span className="ml-2 text-slate-500 text-xs font-normal">({r.date})</span>
                      </td>
                      <td className="px-6 py-4 text-orange-400 font-semibold">
                        {r.calories} kcal
                      </td>
                      <td className="px-6 py-4 text-blue-400 font-semibold">
                        {r.water} ml
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {r.meals} {r.meals === 1 ? 'meal' : 'meals'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
