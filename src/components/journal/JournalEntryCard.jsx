import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Camera, Heart, BookOpen, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { moods } from '../ui/MoodSelector';

export default function JournalEntryCard({ entry, onClick }) {
  const moodData = moods.find(m => m.id === entry.mood);
  const isMoment = entry.type === 'moment';

  const hasPhoto = isMoment && entry.photo_url;
  const hasNoPhoto = isMoment && !entry.photo_url;

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl cursor-pointer theme-card shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={cn("flex gap-3 items-center", hasNoPhoto && "flex-col")}>
        {/* Image, Mood, or Photo Preview */}
        {!hasNoPhoto && (
          <div className={cn(
            "w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center relative",
            !isMoment && (moodData?.color || "bg-slate-100")
          )}>
            {hasPhoto ? (
              <img 
                src={entry.photo_url} 
                alt="Entry photo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">{moodData?.emoji || '💭'}</span>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn("flex-1 py-2 flex flex-col justify-center min-w-0", hasNoPhoto && "px-4")}>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
              isMoment 
                ? "bg-sky-100 text-sky-600" 
                : "bg-amber-100 text-amber-600"
            )}>
              {isMoment ? 'Moment' : moodData?.label || 'Mood'}
            </span>
            <span className="text-xs text-slate-400">
              {format(new Date(entry.created_date), 'MMM d')}
            </span>
          </div>
          
          <p className="text-sm line-clamp-1 theme-text-primary">
            {entry.reflection || (isMoment ? 'A glimpse of God...' : 'Heart check-in')}
          </p>

          {entry.verse_reference && (
            <div className="flex items-center gap-1.5 text-slate-400 mt-1">
              <BookOpen className="w-3 h-3" />
              <span className="text-xs truncate">
                {entry.verse_reference}
              </span>
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </motion.div>
  );
}