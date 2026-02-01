import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function VerseCard({ 
  verse, 
  reference, 
  version = 'NIV', 
  onRefresh,
  loading = false,
  className 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-white to-amber-50/30",
        "border border-sky-100 shadow-sm p-6",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/40 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-sky-100/40 to-transparent rounded-tr-full" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100">
              <BookOpen className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-xs font-medium text-sky-600 uppercase tracking-wider">
              Scripture
            </span>
          </div>
          {onRefresh && (
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-white/80 transition-colors"
            >
              <RefreshCw className={cn(
                "w-4 h-4 text-slate-400",
                loading && "animate-spin"
              )} />
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-4/6" />
          </div>
        ) : (
          <>
            <p className="text-slate-800 leading-relaxed font-serif text-lg italic mb-4">
              "{verse}"
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">
                — {reference}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-white/80 text-slate-500 font-medium">
                {version}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}