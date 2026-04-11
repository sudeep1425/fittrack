import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DailyLogPage from './pages/DailyLogPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import BMIPage from './pages/BMIPage';
import ZenModePage from './pages/ZenModePage';
import ActivityStatsPage from './pages/ActivityStatsPage';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/daily-log" element={<ProtectedRoute><DailyLogPage /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityStatsPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/bmi" element={<ProtectedRoute><BMIPage /></ProtectedRoute>} />
        <Route path="/zen-mode" element={<ProtectedRoute><ZenModePage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
