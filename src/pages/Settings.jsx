import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  BookOpen, LogOut, ChevronRight, Check, 
  User, Flame, Camera, Heart, Info, Palette, FileText
} from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { cn } from "@/lib/utils";

const bibleVersions = [
  { id: 'NIV', name: 'NIV', desc: 'New International Version' },
  { id: 'ESV', name: 'ESV', desc: 'English Standard Version' },
  { id: 'KJV', name: 'KJV', desc: 'King James Version' },
  { id: 'NLT', name: 'NLT', desc: 'New Living Translation' },
  { id: 'CSB', name: 'CSB', desc: 'Christian Standard Bible' },
  { id: 'NKJV', name: 'NKJV', desc: 'New King James Version' },
  { id: 'NASB', name: 'NASB', desc: 'New American Standard' },
  { id: 'MSG', name: 'MSG', desc: 'The Message' },
];

const themes = [
  {
    id: 'morning_dew',
    name: 'Morning Dew',
    description: 'Fresh & restorative',
    icon: '🌅',
    colors: { primary: '#C8E6F5', accent: '#A8DADC', warm: '#E8D5F2' }
  },
  {
    id: 'still_waters',
    name: 'Still Waters',
    description: 'Serene & restful',
    icon: '🌊',
    colors: { primary: '#7FA8D1', accent: '#E1BEE7', warm: '#C8A8E6' }
  },
  {
    id: 'eternal_hope',
    name: 'Eternal Hope',
    description: 'Warm & uplifting',
    icon: '✨',
    colors: { primary: '#F5C5A8', accent: '#FADADD', warm: '#F9E4B7' }
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode',
    description: 'Mysterious & rich',
    icon: '🌙',
    colors: { primary: '#2D1B4E', accent: '#8B5FBF', warm: '#6B4BA6' }
  }
];

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBiblePicker, setShowBiblePicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

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

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (_, variables) => {
      setUser(prev => ({ ...prev, ...variables }));
    },
  });

  const handleBibleVersionChange = async (version) => {
    await updateUserMutation.mutateAsync({ preferred_bible_version: version });
    setShowBiblePicker(false);
  };



  const handleThemeChange = async (themeId) => {
    await updateUserMutation.mutateAsync({ theme: themeId });
    setShowThemePicker(false);
    window.location.reload(); // Reload to apply theme
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'transparent', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Header */}
      <div className="px-6 pt-3 pb-2">
        <h1 className="text-2xl font-bold theme-text-primary">Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl theme-card shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold theme-text-primary">{user?.full_name || 'Friend'}</h2>
            <p className="text-sm theme-text-secondary">{user?.email}</p>
          </div>


        </motion.div>
      </div>

      {/* Settings List */}
      <div className="px-6 space-y-3">
        {/* Profile */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(createPageUrl('Profile'))}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/9659554a5_profile2.jpg" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-medium theme-text-primary">Profile</p>
              <p className="text-sm theme-text-secondary">View your account details</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 theme-text-secondary" />
        </motion.button>

        {/* Theme */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowThemePicker(true)}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/e80323456_theme.jpg" 
                alt="Theme"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-medium theme-text-primary">Theme</p>
              <p className="text-sm theme-text-secondary">
                {themes.find(t => t.id === (user?.theme || 'morning_dew'))?.name}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 theme-text-secondary" />
        </motion.button>

        {/* Bible Version */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBiblePicker(true)}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/9a0adfe6e_newbible.jpg" 
                alt="Bible Version"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-medium theme-text-primary">Bible Version</p>
              <p className="text-sm theme-text-secondary">{user?.preferred_bible_version || 'NIV'}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 theme-text-secondary" />
        </motion.button>




      </div>

      {/* License Button */}
      <div className="px-6 mt-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(createPageUrl('License'))}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/29b034366_cross.jpg" 
                alt="Bible"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-medium theme-text-primary">License</p>
              <p className="text-sm theme-text-secondary">MIT License</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 theme-text-secondary" />
        </motion.button>
      </div>

      {/* Support Button */}
      <div className="px-6 mt-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(createPageUrl('Support'))}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/2d764fa06_heart.jpg" 
                alt="Support"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-medium theme-text-primary">Support This App</p>
              <p className="text-sm theme-text-secondary">Help keep this app alive</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 theme-text-secondary" />
        </motion.button>
      </div>

      {/* App Info */}
      <div className="px-6 mt-8 text-center">
        <p className="text-sm theme-text-secondary">Divine Daily v1.0</p>
        <p className="text-xs theme-text-secondary mt-1">
          Spot God today. Hear His heart. Journal the journey.
        </p>
      </div>

      {/* Theme Picker Modal */}
      {showThemePicker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setShowThemePicker(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl p-6"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: 'var(--border-color)' }} />
            <h3 className="text-lg font-bold theme-text-primary mb-4">Choose Theme</h3>
            <div className="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all text-left theme-card",
                    (user?.theme || 'morning_dew') === theme.id
                      ? "border-sky-500"
                      : ""
                  )}
                  style={{ borderColor: (user?.theme || 'morning_dew') === theme.id ? '#0ea5e9' : 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{theme.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold theme-text-primary">{theme.name}</h4>
                      <p className="text-sm theme-text-secondary">{theme.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: theme.colors.primary }} />
                      <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: theme.colors.accent }} />
                      <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: theme.colors.warm }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bible Version Picker Modal */}
      {showBiblePicker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setShowBiblePicker(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: 'var(--border-color)' }} />
            <h3 className="text-lg font-bold theme-text-primary mb-4">Choose Bible Version</h3>
            <div className="space-y-2">
              {bibleVersions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => handleBibleVersionChange(version.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between theme-card",
                    user?.preferred_bible_version === version.id
                      ? "border-sky-400"
                      : ""
                  )}
                  style={{ borderColor: user?.preferred_bible_version === version.id ? '#0ea5e9' : 'var(--border-color)' }}
                >
                  <div>
                    <span className="font-semibold theme-text-primary">{version.name}</span>
                    <span className="theme-text-secondary text-sm ml-2">{version.desc}</span>
                  </div>
                  {user?.preferred_bible_version === version.id && (
                    <Check className="w-5 h-5 text-sky-500" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}