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

// Removed - will be fetched from API

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
    colors: { primary: '#3A2A1A', accent: '#5A4A3A', warm: '#7A6A5A' }
  }
];

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBiblePicker, setShowBiblePicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [bibleVersions, setBibleVersions] = useState([]);

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

    // Fetch Bible versions from YouVersion
    base44.functions.invoke('getYouVersionBibles', { language: 'en' })
      .then(response => {
        const filteredVersions = (response.data.bibles || []).filter(
          bible => !bible.local_title?.includes('Orthodox Jewish') && !bible.title?.includes('Orthodox Jewish')
        );
        setBibleVersions(filteredVersions);
      })
      .catch(console.error);
  }, []);

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (_, variables) => {
      setUser(prev => ({ ...prev, ...variables }));
    },
  });

  const handleBibleVersionChange = async (version) => {
    await updateUserMutation.mutateAsync({ 
      bible_version: version.id,
      bible_version_name: version.abbreviation || version.local_title
    });
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
            <div className="text-left">
              <p className="font-medium theme-text-primary">Bible Version</p>
              <p className="text-sm theme-text-secondary">{user?.bible_version_name || 'Not set'}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 theme-text-secondary" />
        </motion.button>




      </div>

      {/* Privacy Button */}
      <div className="px-6 mt-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(createPageUrl('Privacy'))}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="font-medium theme-text-primary">Privacy Policy</p>
              <p className="text-sm theme-text-secondary">How we protect your data</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 theme-text-secondary" />
        </motion.button>
      </div>

      {/* Terms of Service Button */}
      <div className="px-6 mt-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(createPageUrl('Terms'))}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="font-medium theme-text-primary">Terms of Service</p>
              <p className="text-sm theme-text-secondary">Usage terms and conditions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 theme-text-secondary" />
        </motion.button>
      </div>

      {/* License Button */}
      <div className="px-6 mt-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(createPageUrl('License'))}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
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
              {bibleVersions.length === 0 ? (
                <div className="text-center py-8 theme-text-secondary">
                  <div className="flex gap-2 justify-center">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : (
                bibleVersions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => handleBibleVersionChange(version)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between theme-card",
                      user?.bible_version === version.id
                        ? "border-sky-400"
                        : ""
                    )}
                    style={{ borderColor: user?.bible_version === version.id ? '#0ea5e9' : 'var(--border-color)' }}
                  >
                    <div>
                      <span className="font-semibold theme-text-primary">
                        {version.local_title || version.title}
                      </span>
                      <span className="theme-text-secondary text-sm ml-2">
                        {version.abbreviation}
                      </span>
                    </div>
                    {user?.bible_version === version.id && (
                      <Check className="w-5 h-5 text-sky-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}