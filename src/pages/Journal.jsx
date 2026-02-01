import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';
import { Search, Filter, Calendar, Camera, Heart, TrendingUp, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import { cn } from "@/lib/utils";

const filters = [
  { id: 'all', label: 'All', icon: null },
  { id: 'moment', label: 'Moments', icon: Camera },
  { id: 'mood', label: 'Moods', icon: Heart },
  { id: 'favorites', label: 'Favorites', icon: Star },
];

export default function Journal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date'),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorite-verses'],
    queryFn: () => base44.entities.FavoriteVerse.list('-created_date'),
  });

  // Filter entries
  const filteredEntries = activeFilter === 'favorites' ? [] : entries.filter(entry => {
    const matchesFilter = activeFilter === 'all' || entry.type === activeFilter;
    const matchesSearch = !searchQuery || 
      entry.reflection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filteredFavorites = activeFilter === 'favorites' ? favorites.filter(fav => {
    const matchesSearch = !searchQuery ||
      fav.verse_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  // Group by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = format(new Date(entry.created_date), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {});

  // Weekly stats
  const thisWeek = {
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  };
  
  const weeklyEntries = entries.filter(e => 
    isWithinInterval(new Date(e.created_date), thisWeek)
  );
  
  const weeklyMoments = weeklyEntries.filter(e => e.type === 'moment').length;
  const weeklyMoods = weeklyEntries.filter(e => e.type === 'mood').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-lg z-10 border-b border-slate-100">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Journal</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries, verses, tags..."
              className="pl-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4 flex gap-2 overflow-x-auto">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeFilter === filter.id
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-amber-50 border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-slate-700">This Week</span>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-500" />
              <span className="text-2xl font-bold text-slate-800">{weeklyMoments}</span>
              <span className="text-sm text-slate-500">moments</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-500" />
              <span className="text-2xl font-bold text-slate-800">{weeklyMoods}</span>
              <span className="text-sm text-slate-500">check-ins</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Entries */}
      <div className="px-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : activeFilter === 'favorites' ? (
          filteredFavorites.length > 0 ? (
            <div className="space-y-3">
              {filteredFavorites.map((fav) => (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 border border-slate-200"
                >
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sky-600 mb-2">{fav.verse_reference}</h3>
                      <p 
                        className="text-slate-800 leading-relaxed font-serif"
                        style={fav.highlight_color ? { 
                          backgroundColor: fav.highlight_color,
                          padding: '2px 4px',
                          borderRadius: '4px'
                        } : {}}
                      >
                        {fav.verse_text}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">{fav.bible_version}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Star className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-700 mb-1">No favorite verses yet</h3>
              <p className="text-sm text-slate-400">Tap verses in the Bible to save favorites</p>
            </motion.div>
          )
        ) : Object.keys(groupedEntries).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dayEntries]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-medium text-slate-500">
                    {format(new Date(date), 'EEEE, MMMM d')}
                  </h3>
                </div>
                <div className="space-y-3">
                  {dayEntries.map((entry) => (
                    <JournalEntryCard 
                      key={entry.id} 
                      entry={entry}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-4xl mb-3">📖</div>
            <h3 className="font-semibold text-slate-700 mb-1">
              {searchQuery ? 'No matches found' : 'No entries yet'}
            </h3>
            <p className="text-sm text-slate-400">
              {searchQuery ? 'Try a different search term' : 'Start capturing God moments'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}