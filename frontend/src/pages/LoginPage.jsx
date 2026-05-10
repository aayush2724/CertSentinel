import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { login as apiLogin } from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiLogin(username, password);
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Hint: admin/password');
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-light text-primary rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Secure Access</h2>
          <p className="text-slate-500">CertSentinel Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p className="text-danger text-sm font-semibold">{error}</p>}

          <button type="submit" className="btn btn-primary w-full py-4 text-lg">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
