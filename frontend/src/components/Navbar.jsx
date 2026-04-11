import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, BarChart2, User, Shield, LogOut, Activity, Scale, Wind
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/daily-log', label: 'Daily Log', icon: BookOpen },
  { to: '/activity',  label: 'Activity',  icon: Activity },
  { to: '/reports',   label: 'Reports',   icon: BarChart2 },
  { to: '/bmi',       label: 'BMI',       icon: Scale },
  { to: '/zen-mode',  label: 'Zen Mode',  icon: Wind },
  { to: '/profile',   label: 'Profile',   icon: User },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">FitTrack</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Shield size={16} />
                Admin
              </NavLink>
            )}
          </div>

          {/* User & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-300 text-sm font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-slate-400 hover:text-white'
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white">
              <Shield size={14} /> Admin
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
