import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ShieldCheck, History, LogOut } from 'lucide-react';
import VerifyPage from './pages/VerifyPage';
import HistoryPage from './pages/HistoryPage';
import ReportPage from './pages/ReportPage';
import LoginPage from './pages/LoginPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

function App() {
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b sticky top-0 z-50">
          <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary">
              <ShieldCheck size={32} />
              <span className="text-xl font-bold tracking-tight text-slate-900">CertSentinel</span>
            </Link>
            
            <div className="flex gap-8 items-center">
              <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                Verify
              </Link>
              <Link to="/history" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                History
              </Link>
              <button onClick={logout} className="text-slate-400 hover:text-danger transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </nav>
        </header>

        <main className="py-12">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><VerifyPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/report/:id" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          </Routes>
        </main>

        <footer className="border-t py-12 bg-white">
          <div className="container mx-auto px-6 text-center">
            <p className="text-slate-500 text-sm">
              &copy; 2026 CertSentinel. Advanced Medical Certificate Verification.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
