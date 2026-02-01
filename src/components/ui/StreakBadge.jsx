import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Heart, Eye, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

const badgeConfig = {
  '7-day-seer': { icon: Eye, label: '7-Day Seer', color: 'from-amber-400 to-orange-500' },
  'heart-listener': { icon: Heart, label: 'Heart Listener', color: 'from-rose-400 to-pink-500' },
  'faithful-one': { icon: Star, label: 'Faithful One', color: 'from-violet-400 to-purple-500' },
  'joy-finder': { icon: Sparkles, label: 'Joy Finder', color: 'from-amber-300 to-yellow-500' },
};

export function StreakCounter({ streak, animate = true }) {
  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
    >
      <motion.div
        animate={streak > 0 ? { 
          scale: [1, 1.2, 1],
        } : {}}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <Flame className={cn(
          "w-5 h-5",
          streak > 0 ? "text-orange-500" : "text-slate-300"
        )} />
      </motion.div>
      <span className="font-bold text-slate-800">{streak}</span>
      <span className="text-sm text-slate-500">day streak</span>
    </motion.div>
  );
}

export function Badge({ type, earned = true, size = 'default' }) {
  const config = badgeConfig[type];
  if (!config) return null;
  
  const Icon = config.icon;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "flex flex-col items-center gap-1",
        !earned && "opacity-40 grayscale"
      )}
    >
      <div className={cn(
        "rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center",
        config.color,
        size === 'small' ? "w-12 h-12" : "w-16 h-16"
      )}>
        <Icon className={cn(
          "text-white",
          size === 'small' ? "w-6 h-6" : "w-8 h-8"
        )} />
      </div>
      <span className={cn(
        "text-slate-600 font-medium text-center",
        size === 'small' ? "text-xs" : "text-sm"
      )}>
        {config.label}
      </span>
    </motion.div>
  );
}

export function BadgeGrid({ badges = [], earnedBadges = [] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Object.keys(badgeConfig).map((type) => (
        <Badge 
          key={type} 
          type={type} 
          earned={earnedBadges.includes(type)}
          size="small"
        />
      ))}
    </div>
  );
}