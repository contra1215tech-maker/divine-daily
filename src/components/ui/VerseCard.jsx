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
        "relative overflow-hidden rounded-3xl theme-card p-6",
        className
      )}
      style={{ borderColor: 'var(--border-color)' }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-30" style={{ backgroundColor: 'var(--accent-warm)' }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-full opacity-30" style={{ backgroundColor: 'var(--accent-primary)' }} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl theme-accent">
              <BookOpen className="w-4 h-4 theme-text-primary" />
            </div>
            <span className="text-xs font-medium theme-text-primary uppercase tracking-wider">
              Scripture
            </span>
          </div>
          {onRefresh && (
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl transition-colors"
              style={{ backgroundColor: 'var(--card-overlay)' }}
            >
              <RefreshCw className={cn(
                "w-4 h-4 theme-text-secondary",
                loading && "animate-spin"
              )} />
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.3 }} />
            <div className="h-4 rounded w-5/6" style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.3 }} />
            <div className="h-4 rounded w-4/6" style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.3 }} />
          </div>
        ) : (
          <>
            <p className="theme-text-primary leading-relaxed font-serif text-lg italic mb-4">
              "{verse}"
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold theme-text-primary">
                — {reference}
              </span>
              <span className="text-xs px-2 py-1 rounded-full theme-text-secondary font-medium" style={{ backgroundColor: 'var(--card-overlay)' }}>
                {version}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}