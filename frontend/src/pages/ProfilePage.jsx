import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { User, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', age: '', gender: '', height: '', weight: '',
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/user/${user._id}`);
        setProfile(res.data);
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          age: res.data.age || '',
          gender: res.data.gender || '',
          height: res.data.height || '',
          weight: res.data.weight || '',
        });
      } catch (err) {
        console.error('Fetch profile error:', err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/user/${user._id}`, form);
      updateUser({ ...user, ...res.data });
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all";

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center pt-20">
      <Loader2 size={32} className="text-indigo-400 animate-spin" />
    </div>
  );

  const bmi = profile?.height && profile?.weight
    ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
    : null;
  const bmiLabel = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    : null;
  const bmiColor = bmi
    ? bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-emerald-400' : bmi < 30 ? 'text-yellow-400' : 'text-rose-400'
    : '';

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="text-indigo-400" size={24} /> Profile
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage your personal information</p>
        </div>

        {/* Avatar + Stats */}
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700/30 rounded-2xl p-6 mb-6 flex items-center gap-6 flex-wrap">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/30 flex-shrink-0">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-xl font-bold truncate">{profile?.name}</h2>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-medium capitalize">
              {profile?.role || 'User'}
            </span>
          </div>
          
          {bmi && (
            <div className="text-center px-4">
              <p className={`text-3xl font-bold ${bmiColor}`}>{bmi}</p>
              <p className={`text-xs font-medium ${bmiColor}`}>{bmiLabel}</p>
              <p className="text-slate-500 text-xs mt-1">BMI</p>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6">Edit Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Age</label>
                <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={inputClass} placeholder="25" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputClass + ' cursor-pointer'}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Height (cm)</label>
                <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className={inputClass} placeholder="175" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Weight (kg)</label>
                <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className={inputClass} placeholder="70" />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2 justify-center transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}