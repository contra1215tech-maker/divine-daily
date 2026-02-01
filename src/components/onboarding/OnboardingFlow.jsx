import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, BookOpen, Heart } from 'lucide-react';
import AnimatedButton from '../ui/AnimatedButton';
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

const steps = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Welcome to Divine Daily',
    subtitle: 'Spot God today. Hear His heart. Journal the journey.',
  },
  {
    id: 'bible',
    icon: BookOpen,
    title: 'Choose Your Bible',
    subtitle: 'Select your preferred translation for Scripture.',
  },
  {
    id: 'ready',
    icon: Heart,
    title: "You're All Set!",
    subtitle: 'Start spotting God in your everyday moments.',
  },
];

export default function OnboardingFlow({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState({
    preferred_bible_version: 'NIV',
    alternate_versions: [],
  });

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(settings);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleAlternateVersion = (version) => {
    const current = settings.alternate_versions;
    if (current.includes(version)) {
      setSettings({ ...settings, alternate_versions: current.filter(v => v !== version) });
    } else if (current.length < 2) {
      setSettings({ ...settings, alternate_versions: [...current, version] });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50/30 flex flex-col">
      {/* Progress dots */}
      <div className="pt-8 px-6">
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ 
                width: i === currentStep ? 24 : 8,
                backgroundColor: i <= currentStep ? '#5DADE2' : '#E2E8F0'
              }}
              className="h-2 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-200"
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{step.title}</h1>
              <p className="text-slate-500">{step.subtitle}</p>
            </div>

            {/* Step content */}
            <div className="flex-1">
              {step.id === 'welcome' && (
                <div className="space-y-4 text-center">
                  <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                    {['📸', '💛', '📖'].map((emoji, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="aspect-square rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl"
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 mt-6 max-w-xs mx-auto">
                    Capture moments where you see God at work, check in with your heart, and grow in daily awareness of His presence.
                  </p>
                </div>
              )}

              {step.id === 'bible' && (
                <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                  <p className="text-sm text-slate-500 text-center mb-4">
                    Primary version • Select up to 2 alternates for comparison
                  </p>
                  {bibleVersions.map((version) => {
                    const isPrimary = settings.preferred_bible_version === version.id;
                    const isAlternate = settings.alternate_versions.includes(version.id);
                    
                    return (
                      <motion.button
                        key={version.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isPrimary) return;
                          if (isAlternate) {
                            toggleAlternateVersion(version.id);
                          } else if (!settings.alternate_versions.includes(version.id)) {
                            if (settings.preferred_bible_version !== version.id) {
                              setSettings({ ...settings, preferred_bible_version: version.id });
                            }
                          }
                        }}
                        onDoubleClick={() => toggleAlternateVersion(version.id)}
                        className={cn(
                          "w-full p-4 rounded-2xl border-2 text-left transition-all",
                          isPrimary 
                            ? "border-sky-400 bg-sky-50" 
                            : isAlternate
                            ? "border-amber-300 bg-amber-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{version.name}</span>
                            <span className="text-slate-400 text-sm ml-2">{version.desc}</span>
                          </div>
                          {isPrimary && (
                            <span className="text-xs px-2 py-1 rounded-full bg-sky-500 text-white font-medium">
                              Primary
                            </span>
                          )}
                          {isAlternate && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-400 text-white font-medium">
                              Alt
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}



              {step.id === 'ready' && (
                <div className="text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="text-7xl"
                  >
                    🙌
                  </motion.div>
                  <p className="text-slate-600 max-w-xs mx-auto">
                    God is always at work around you. Let's start noticing His presence together.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 pb-8">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <AnimatedButton
              variant="secondary"
              onClick={handleBack}
              icon={ChevronLeft}
              className="flex-shrink-0"
            />
          )}
          <AnimatedButton
            variant="primary"
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? "Let's Begin" : 'Continue'}
            {currentStep < steps.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}