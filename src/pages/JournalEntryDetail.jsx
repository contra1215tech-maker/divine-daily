import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, BookOpen, Tag, Heart, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { moods } from '../components/ui/MoodSelector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function JournalEntryDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const entryId = urlParams.get('id');

  const { data: entry, isLoading } = useQuery({
    queryKey: ['journal-entry', entryId],
    queryFn: async () => {
      const entries = await base44.entities.JournalEntry.filter({ id: entryId });
      return entries[0];
    },
    enabled: !!entryId,
  });

  const deleteEntryMutation = useMutation({
    mutationFn: () => base44.entities.JournalEntry.delete(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      navigate(-1);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="theme-text-secondary">Entry not found</p>
      </div>
    );
  }

  const moodData = moods.find(m => m.id === entry.mood);
  const isMoment = entry.type === 'moment';

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-lg z-10 px-6 py-4" style={{
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full border-2 theme-text-primary flex items-center justify-center"
              style={{ borderColor: 'var(--text-light)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold theme-text-primary">
                {isMoment ? 'Moment' : moodData?.label || 'Entry'}
              </h1>
              <p className="text-xs theme-text-secondary">
                {format(new Date(entry.created_date), 'EEEE, MMMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center theme-text-secondary hover:opacity-70 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this journal entry. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteEntryMutation.mutate()}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Photo */}
        {entry.photo_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden"
          >
            <img
              src={entry.photo_url}
              alt="Journal moment"
              className="w-full h-auto object-cover"
            />
          </motion.div>
        )}

        {/* Mood Display */}
        {!isMoment && moodData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-2xl theme-card"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${moodData.color}`}>
              <span className="text-3xl">{moodData.emoji}</span>
            </div>
            <div>
              <p className="text-sm theme-text-secondary">Feeling</p>
              <p className="text-lg font-semibold theme-text-primary">{moodData.label}</p>
            </div>
          </motion.div>
        )}

        {/* Reflection */}
        {entry.reflection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl theme-card"
          >
            <h2 className="text-sm font-semibold theme-text-secondary mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Reflection
            </h2>
            <p className="leading-relaxed theme-text-primary whitespace-pre-wrap">
              {entry.reflection}
            </p>
          </motion.div>
        )}

        {/* Verse */}
        {entry.verse_text && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl theme-card"
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 theme-text-secondary" />
              <h2 className="text-sm font-semibold theme-text-secondary">Scripture</h2>
            </div>
            <p className="leading-relaxed font-serif theme-text-primary mb-3">
              {entry.verse_text}
            </p>
            <p className="text-sm theme-text-secondary">
              {entry.verse_reference} {entry.bible_version && `(${entry.bible_version})`}
            </p>
          </motion.div>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <Tag className="w-4 h-4 theme-text-secondary" />
            {entry.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-sm theme-card theme-text-primary"
              >
                #{tag}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}