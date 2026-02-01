import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Camera, Heart, BookOpen, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { moods } from '../ui/MoodSelector';

export default function JournalEntryCard({ entry, onClick }) {
  const moodData = moods.find(m => m.id === entry.mood);
  const isMoment = entry.type === 'moment';

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-3xl cursor-pointer",
        "bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
      )}
    >
      <div className="flex">
        {/* Image or Mood Display */}
        {isMoment && entry.photo_url ? (
          <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
            <img 
              src={entry.photo_url} 
              alt="Moment"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={cn(
            "w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center",
            moodData?.color || "bg-slate-100"
          )}>
            {isMoment ? (
              <Camera className="w-8 h-8 text-slate-400" />
            ) : (
              <span className="text-5xl">{moodData?.emoji || '💭'}</span>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                isMoment 
                  ? "bg-sky-100 text-sky-600" 
                  : "bg-amber-100 text-amber-600"
              )}>
                {isMoment ? 'Moment' : moodData?.label || 'Mood'}
              </span>
            </div>
            
            <p className="text-slate-700 text-sm line-clamp-2 mb-2">
              {entry.reflection || (isMoment ? 'A glimpse of God...' : 'Heart check-in')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-xs truncate max-w-[120px]">
                {entry.verse_reference || 'No verse'}
              </span>
            </div>
            
            <span className="text-xs text-slate-400">
              {format(new Date(entry.created_date), 'MMM d')}
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </div>
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          {entry.tags.slice(0, 3).map((tag, i) => (
            <span 
              key={i}
              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}