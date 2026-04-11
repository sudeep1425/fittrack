import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  </StrictMode>
);
