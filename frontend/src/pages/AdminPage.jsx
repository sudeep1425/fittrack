import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Shield, Users, UtensilsCrossed, Droplets, Activity, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { label: 'Total Meals', value: stats.totalMeals, icon: UtensilsCrossed, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Total Water (ml)', value: `${stats.totalWater} ml`, icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Active Today', value: stats.activeToday, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-purple-400" size={24} /> Admin Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Platform overview and user management</p>
        </div>

        {loading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="text-purple-400 animate-spin" size={32} />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
                <div key={label} className={`bg-slate-800/60 border ${border} rounded-2xl p-5`}>
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-slate-400 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Users size={18} className="text-indigo-400" /> All Users
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      {['Name', 'Email', 'Gender', 'Age', 'Meals Logged', 'Water (ml)'].map((h) => (
                        <th key={h} className="text-left text-slate-400 font-medium px-6 py-3 text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500">No users found</td>
                      </tr>
                    ) : users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{u.email}</td>
                        <td className="px-6 py-4 text-slate-400">{u.gender || '—'}</td>
                        <td className="px-6 py-4 text-slate-400">{u.age || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-xs font-semibold">
                            {u.meal_count}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold">
                            {u.total_water} ml
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
