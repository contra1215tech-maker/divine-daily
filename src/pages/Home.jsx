import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Camera, Heart, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { StreakCounter } from '@/components/ui/StreakBadge';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

const dailyPrompts = [
  "Where did you see God's kindness today?",
  "What moment felt like a gentle whisper from heaven?",
  "How did God show up in the ordinary today?",
  "What blessing are you noticing right now?",
  "Where did you feel God's peace today?",
  "What beauty reminded you of the Creator?",
  "How did you experience grace today?",
  "What made your heart thankful?",
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

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

  const { data: recentEntries = [] } = useQuery({
    queryKey: ['recent-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 5),
    enabled: !!user?.onboarding_complete,
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (data) => {
      setUser(prev => ({ ...prev, ...data }));
    },
  });

  const handleOnboardingComplete = async (settings) => {
    await updateUserMutation.mutateAsync({
      ...settings,
      onboarding_complete: true,
      current_streak: 0,
      longest_streak: 0,
      total_moments: 0,
      total_moods: 0,
      badges: [],
    });
  };

  const todayPrompt = dailyPrompts[new Date().getDate() % dailyPrompts.length];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50/30 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user?.onboarding_complete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="px-6 pt-3 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm theme-text-secondary">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
            <h1 className="text-2xl font-bold theme-text-primary">
              Hello, {user.full_name?.split(' ')[0] || 'Friend'} ✨
            </h1>
          </div>
          <StreakCounter streak={user.current_streak || 0} />
        </div>

        {/* Daily Prompt Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl theme-button p-6 text-white shadow-xl"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium text-sky-100">Today's Prompt</span>
            </div>
            <p className="text-xl font-semibold leading-relaxed">
              {todayPrompt}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <Link to={createPageUrl('CaptureMoment')}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-3xl theme-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl theme-accent flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 theme-text-primary" />
              </div>
              <h3 className="font-semibold theme-text-primary">Capture Moment</h3>
              <p className="text-sm theme-text-secondary mt-1">Spot God today</p>
            </motion.div>
          </Link>

          <Link to={createPageUrl('HeartCheck')}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-3xl theme-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl theme-accent flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 theme-text-primary" />
              </div>
              <h3 className="font-semibold theme-text-primary">Check Heart</h3>
              <p className="text-sm theme-text-secondary mt-1">How are you feeling?</p>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold theme-text-primary">Recent Entries</h2>
          <Link 
            to={createPageUrl('Journal')}
            className="flex items-center gap-1 text-sm font-medium theme-text-secondary"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <JournalEntryCard 
                key={entry.id} 
                entry={entry}
                onClick={() => {}} 
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-6 rounded-3xl bg-white/50 border border-dashed border-slate-200"
          >
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="font-semibold text-slate-700 mb-1">Your journey begins</h3>
            <p className="text-sm text-slate-400">
              Capture your first God moment or check in with your heart
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}