import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User as UserIcon, Calendar, LogOut, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-lg z-10 px-6 py-4" style={{
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border-2 theme-text-primary flex items-center justify-center"
            style={{ borderColor: 'var(--text-light)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold theme-text-primary">Profile</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-white">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        </motion.div>

        {/* User Info Cards */}
        <div className="space-y-3 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl theme-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
                <UserIcon className="w-5 h-5 theme-text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs theme-text-secondary">Full Name</p>
                <p className="font-semibold theme-text-primary">{user?.full_name || 'Not set'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl theme-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
                <Mail className="w-5 h-5 theme-text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs theme-text-secondary">Email</p>
                <p className="font-semibold theme-text-primary">{user?.email}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl theme-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
                <Shield className="w-5 h-5 theme-text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs theme-text-secondary">Account Type</p>
                <p className="font-semibold theme-text-primary capitalize">{user?.role || 'User'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl theme-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
                <Calendar className="w-5 h-5 theme-text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs theme-text-secondary">Member Since</p>
                <p className="font-semibold theme-text-primary">
                  {user?.created_date ? format(new Date(user.created_date), 'MMMM d, yyyy') : 'Unknown'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sign Out Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-center gap-3 mt-8"
        >
          <LogOut className="w-5 h-5 theme-text-primary" />
          <span className="font-semibold theme-text-primary">Sign Out</span>
        </motion.button>

        {/* Info Text */}
        <p className="text-xs text-center theme-text-secondary mt-6">
          To enable Google or Apple sign-in, configure OAuth providers in your Base44 dashboard settings.
        </p>
      </div>
    </div>
  );
}