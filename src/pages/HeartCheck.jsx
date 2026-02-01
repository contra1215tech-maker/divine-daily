import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import MoodSelector from '@/components/ui/MoodSelector';
import VerseCard from '@/components/ui/VerseCard';
import Celebration from '@/components/ui/Celebration';
import { Textarea } from '@/components/ui/textarea';

const moodVerses = {
  joyful: { text: "Rejoice in the Lord always. I will say it again: Rejoice!", reference: "Philippians 4:4" },
  peaceful: { text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.", reference: "John 14:27" },
  grateful: { text: "Give thanks to the Lord, for he is good; his love endures forever.", reference: "Psalm 107:1" },
  hopeful: { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
  anxious: { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.", reference: "Philippians 4:6-7" },
  weary: { text: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28" },
  sad: { text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", reference: "Psalm 34:18" },
  seeking: { text: "You will seek me and find me when you seek me with all your heart.", reference: "Jeremiah 29:13" },
};

export default function HeartCheck() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState(null);
  const [reflection, setReflection] = useState('');
  const [verse, setVerse] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const createEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['recent-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const lastEntry = user.last_entry_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak = user.current_streak || 0;
        if (lastEntry === yesterday) {
          newStreak += 1;
        } else if (lastEntry !== today) {
          newStreak = 1;
        }
        
        await base44.auth.updateMe({
          total_moods: (user.total_moods || 0) + 1,
          current_streak: newStreak,
          longest_streak: Math.max(user.longest_streak || 0, newStreak),
          last_entry_date: today,
        });
      }
      
      setShowCelebration(true);
    },
  });

  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    setVerse(null);
    setLoadingVerse(true);
    
    // Show instant verse
    const defaultVerse = moodVerses[selectedMood];
    setVerse({
      text: defaultVerse.text,
      reference: defaultVerse.reference,
      version: user?.preferred_bible_version || 'NIV'
    });
    setLoadingVerse(false);
    setStep(2);
  };

  const fetchNewVerse = async () => {
    if (!mood) return;
    
    setLoadingVerse(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `I'm feeling ${mood}. Please provide a different Bible verse that speaks to someone feeling ${mood}. 
        
        Return JSON with:
        - verse_text: The actual verse text (2-4 verses max)
        - verse_reference: The reference (e.g., "Psalm 23:4")
        
        Choose a verse that brings comfort, encouragement, or truth for this emotional state.`,
        response_json_schema: {
          type: "object",
          properties: {
            verse_text: { type: "string" },
            verse_reference: { type: "string" }
          }
        }
      });
      
      setVerse({
        text: result.verse_text,
        reference: result.verse_reference,
        version: user?.preferred_bible_version || 'NIV'
      });
    } catch (error) {
      console.error('Failed to fetch verse:', error);
    }
    setLoadingVerse(false);
  };

  const handleSave = async () => {
    if (!mood) return;
    
    setSaving(true);
    await createEntryMutation.mutateAsync({
      type: 'mood',
      mood,
      reflection,
      verse_text: verse?.text,
      verse_reference: verse?.reference,
      bible_version: verse?.version || user?.preferred_bible_version || 'NIV',
      tags: [mood],
    });
    setSaving(false);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-sky-50/30 pb-8">
      <Celebration type="highfive" show={showCelebration} onComplete={handleCelebrationComplete} />
      
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-4 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => step === 1 ? navigate(createPageUrl('Home')) : setStep(1)}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="font-semibold text-slate-800">Heart Check</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 pt-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="text-5xl mb-4"
                >
                  💛
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  How's your heart today?
                </h2>
                <p className="text-slate-500">
                  Take a moment to check in with yourself
                </p>
              </div>

              <MoodSelector 
                selected={mood} 
                onSelect={handleMoodSelect} 
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Verse Response */}
              {verse && (
                <VerseCard
                  verse={verse.text}
                  reference={verse.reference}
                  version={verse.version}
                  onRefresh={fetchNewVerse}
                  loading={loadingVerse}
                />
              )}

              {/* Optional Reflection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Want to reflect? (optional)
                </label>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What's on your mind..."
                  className="min-h-[100px] rounded-2xl border-slate-200 focus:border-amber-300 focus:ring-amber-200 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <AnimatedButton
                  variant="gold"
                  onClick={handleSave}
                  loading={saving}
                  className="w-full"
                >
                  Save Check-In 🙌
                </AnimatedButton>
                
                <AnimatedButton
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Change my mood
                </AnimatedButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}