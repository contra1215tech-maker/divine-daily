import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  BookOpen, Bell, Award, LogOut, ChevronRight, Check, 
  User, Flame, Camera, Heart, Info, Palette
} from 'lucide-react';
import { StreakCounter, BadgeGrid } from '@/components/ui/StreakBadge';
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
    colors: { primary: '#E0F2F1', accent: '#A8DADC', warm: '#FAD5A5' }
  },
  {
    id: 'still_waters',
    name: 'Still Waters',
    description: 'Serene & restful',
    icon: '🌊',
    colors: { primary: '#E0F7FA', accent: '#E1BEE7', warm: '#E8DAB2' }
  },
  {
    id: 'eternal_hope',
    name: 'Eternal Hope',
    description: 'Warm & uplifting',
    icon: '✨',
    colors: { primary: '#FDFBF7', accent: '#FADADD', warm: '#F9E4B7' }
  }
];

export default function Settings() {
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

  const handleNotificationToggle = async () => {
    await updateUserMutation.mutateAsync({ 
      notifications_enabled: !user.notifications_enabled 
    });
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
    <div className="min-h-screen pb-24" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold theme-text-primary">Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl theme-card shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text-primary">{user?.full_name || 'Friend'}</h2>
              <p className="text-sm theme-text-secondary">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-2xl bg-slate-50">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-800">{user?.current_streak || 0}</p>
              <p className="text-xs text-slate-500">Current Streak</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-slate-50">
              <Camera className="w-5 h-5 text-sky-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-800">{user?.total_moments || 0}</p>
              <p className="text-xs text-slate-500">Moments</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-slate-50">
              <Heart className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-800">{user?.total_moods || 0}</p>
              <p className="text-xs text-slate-500">Check-ins</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Badges */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-800">Badges</h3>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100">
          <BadgeGrid earnedBadges={user?.badges || []} />
        </div>
      </div>

      {/* Settings List */}
      <div className="px-6 space-y-3">
        {/* Theme */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowThemePicker(true)}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
              <Palette className="w-5 h-5 theme-text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium theme-text-primary">Theme</p>
              <p className="text-sm theme-text-secondary">
                {themes.find(t => t.id === (user?.theme || 'morning_dew'))?.name}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </motion.button>

        {/* Bible Version */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBiblePicker(true)}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 theme-text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium theme-text-primary">Bible Version</p>
              <p className="text-sm theme-text-secondary">{user?.preferred_bible_version || 'NIV'}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNotificationToggle}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
              <Bell className="w-5 h-5 theme-text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium theme-text-primary">Daily Reminders</p>
              <p className="text-sm theme-text-secondary">
                {user?.notifications_enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <div className={cn(
            "w-12 h-7 rounded-full p-1 transition-colors theme-button",
            !user?.notifications_enabled && "opacity-40"
          )}>
            <motion.div
              animate={{ x: user?.notifications_enabled ? 20 : 0 }}
              className="w-5 h-5 rounded-full bg-white shadow"
            />
          </div>
        </motion.button>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl theme-card flex items-center gap-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
            <LogOut className="w-5 h-5 theme-text-primary" />
          </div>
          <p className="font-medium theme-text-primary">Sign Out</p>
        </motion.button>
      </div>

      {/* App Info */}
      <div className="px-6 mt-8 text-center">
        <p className="text-sm text-slate-400">Divine Daily v1.0</p>
        <p className="text-xs text-slate-400 mt-1">
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
            className="w-full max-w-lg bg-white rounded-t-3xl p-6"
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-4">Choose Theme</h3>
            <div className="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all text-left",
                    (user?.theme || 'morning_dew') === theme.id
                      ? "border-sky-500 bg-sky-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{theme.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{theme.name}</h4>
                      <p className="text-sm text-slate-500">{theme.description}</p>
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
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-4">Choose Bible Version</h3>
            <div className="space-y-2">
              {bibleVersions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => handleBibleVersionChange(version.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between",
                    user?.preferred_bible_version === version.id
                      ? "border-sky-400 bg-sky-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div>
                    <span className="font-semibold text-slate-800">{version.name}</span>
                    <span className="text-slate-400 text-sm ml-2">{version.desc}</span>
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