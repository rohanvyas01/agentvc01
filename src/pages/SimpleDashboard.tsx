import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SimpleDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        
        {user ? (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Welcome!</h2>
              <p className="text-slate-300">User ID: {user.id}</p>
              <p className="text-slate-300">Email: {user.email}</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Test</h3>
              <p className="text-green-400">✅ Authentication working</p>
              <p className="text-green-400">✅ Dashboard component loading</p>
              <p className="text-green-400">✅ Styling working</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
              <ol className="text-slate-300 space-y-2">
                <li>1. Create user profile data in Supabase</li>
                <li>2. Test database connections</li>
                <li>3. Enable full dashboard features</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <p className="text-red-400">Not authenticated</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDashboard;