import React, { useState, useEffect } from "react";
import api from "./api/axios";
import { 
  Users, 
  Activity, 
  Droplets, 
  ShieldCheck, 
  Search,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = ({ darkMode }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats')
        ]);
        setUsers(usersRes.data);
        setStats(statsRes.data);
      } catch (err) {
        toast.error("Failed to fetch admin data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardClasses = darkMode 
    ? "bg-white/10 backdrop-blur-lg border-white/20 shadow-xl" 
    : "bg-white border-slate-200 shadow-md";

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-purple-500" size={48} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3">
            <ShieldCheck className="text-purple-500" size={40} />
            Admin Command Center
          </h1>
          <p className="opacity-60 mt-1 font-medium uppercase tracking-widest text-xs">Platform Overview & User Management</p>
        </div>
      </div>

      {/* Platform Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardClasses} p-6 rounded-3xl border group hover:scale-[1.02] transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
              <Users size={24} />
            </div>
            <ArrowUpRight className="opacity-20 group-hover:opacity-100 transition-opacity" size={20} />
          </div>
          <p className="text-sm opacity-60 font-bold uppercase">Total Users</p>
          <p className="text-3xl font-black mt-1">{stats?.totalUsers}</p>
        </div>

        <div className={`${cardClasses} p-6 rounded-3xl border group hover:scale-[1.02] transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-2xl text-green-400">
              <Activity size={24} />
            </div>
            <TrendingUp className="opacity-20 group-hover:opacity-100 transition-opacity" size={20} />
          </div>
          <p className="text-sm opacity-60 font-bold uppercase">Total Meals Logged</p>
          <p className="text-3xl font-black mt-1">{stats?.totalMeals}</p>
        </div>

        <div className={`${cardClasses} p-6 rounded-3xl border group hover:scale-[1.02] transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400">
              <Droplets size={24} />
            </div>
            <ArrowUpRight className="opacity-20 group-hover:opacity-100 transition-opacity" size={20} />
          </div>
          <p className="text-sm opacity-60 font-bold uppercase">Water Tracked</p>
          <p className="text-3xl font-black mt-1">{stats?.totalWater?.toFixed(1)}L</p>
        </div>

        <div className={`${cardClasses} p-6 rounded-3xl border group hover:scale-[1.02] transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400">
              <UserCheck size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-full">
              Live
            </div>
          </div>
          <p className="text-sm opacity-60 font-bold uppercase">Active Today</p>
          <p className="text-3xl font-black mt-1">{stats?.activeToday}</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className={`${cardClasses} rounded-[2.5rem] border overflow-hidden`}>
        <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-black uppercase tracking-widest opacity-60">User Directory</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-12 pr-6 py-3 rounded-2xl border focus:ring-2 focus:ring-purple-500 outline-none transition-all w-full md:w-80 ${
                darkMode ? "bg-slate-800 border-white/10" : "bg-slate-50 border-slate-200"
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`text-xs font-black uppercase tracking-widest opacity-40 ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
                <th className="px-8 py-5">User Info</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Total Meals</th>
                <th className="px-8 py-5">Total Water</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user._id || user.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{user.name}</p>
                        <p className="text-xs opacity-50">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      user.role === 'admin' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-lg">{user.meal_count}</p>
                      <span className="text-[10px] font-bold opacity-30 uppercase">Logins</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-lg">
                    {user.total_water?.toFixed(1) || 0}L
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-bold opacity-60 uppercase">Registered</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
