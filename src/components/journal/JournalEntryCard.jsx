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
      <div className={cn("flex gap-3 items-center w-full", hasNoPhoto && "flex-col")}>
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
        <div className={cn("flex-1 py-2 flex flex-col justify-center min-w-0 w-full overflow-hidden", hasNoPhoto && "px-4")}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 theme-text-primary" style={{ backgroundColor: 'var(--accent-primary)' }}>
              {isMoment ? 'Moment' : moodData?.label || 'Mood'}
            </span>
            <span className="text-xs theme-text-secondary flex-shrink-0">
              {format(new Date(entry.created_date), 'MMM d')}
            </span>
          </div>

          <p className="text-sm line-clamp-1 theme-text-primary break-words w-full">
            {entry.reflection || (isMoment ? 'A glimpse of God...' : 'Heart check-in')}
          </p>

          {entry.verse_reference && (
            <div className="flex items-center gap-1.5 theme-text-secondary mt-1 min-w-0">
              <BookOpen className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">
                {entry.verse_reference}
              </span>
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="pr-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </motion.div>
  );
}