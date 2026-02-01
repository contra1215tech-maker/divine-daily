import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const moods = [
  { id: 'joyful', emoji: '😊', label: 'Joyful', color: 'bg-amber-100 border-amber-300' },
  { id: 'peaceful', emoji: '😌', label: 'Peaceful', color: 'bg-sky-100 border-sky-300' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful', color: 'bg-emerald-100 border-emerald-300' },
  { id: 'hopeful', emoji: '✨', label: 'Hopeful', color: 'bg-violet-100 border-violet-300' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-orange-100 border-orange-300' },
  { id: 'weary', emoji: '😔', label: 'Weary', color: 'bg-slate-100 border-slate-300' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-100 border-blue-300' },
  { id: 'seeking', emoji: '🔍', label: 'Seeking', color: 'bg-purple-100 border-purple-300' },
];

export default function MoodSelector({ selected, onSelect, size = 'default' }) {
  return (
    <div className={cn(
      "grid gap-3",
      size === 'small' ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-4"
    )}>
      {moods.map((mood) => (
        <motion.button
          key={mood.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(mood.id)}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300",
            size === 'small' ? "p-3" : "p-4",
            selected === mood.id 
              ? `${mood.color} shadow-lg ring-2 ring-offset-2 ring-sky-400` 
              : "bg-white/60 border-slate-200 hover:border-slate-300"
          )}
        >
          <span className={cn(
            "mb-1",
            size === 'small' ? "text-2xl" : "text-3xl"
          )}>{mood.emoji}</span>
          <span className={cn(
            "font-medium text-slate-700",
            size === 'small' ? "text-xs" : "text-sm"
          )}>{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

export { moods };