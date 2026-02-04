import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Calendar, Camera, Heart, TrendingUp, Star, Plus, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import { cn } from "@/lib/utils";

const filters = [
  { id: 'entries', label: 'Entries', icon: Camera },
  { id: 'pictures', label: 'Pictures', icon: Image },
  { id: 'favorites', label: 'Favorites', icon: Star },
];

export default function Journal() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('entries');
    const [user, setUser] = useState(null);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(console.error);
    }, []);

  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date'),
  });

  // Filter entries
  const filteredEntries = (activeFilter === 'favorites' || activeFilter === 'pictures') ? [] : entries.filter(entry => {
      const matchesSearch = !searchQuery || 
          entry.reflection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
  });

  const filteredFavorites = activeFilter === 'favorites' ? entries.filter(entry => {
    const isFavorite = entry.is_favorite === true;
    const matchesSearch = !searchQuery ||
      entry.reflection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return isFavorite && matchesSearch;
  }) : [];

  const pictureEntries = activeFilter === 'pictures' ? entries.filter(entry => {
    const hasPicture = entry.photo_url && entry.type === 'moment';
    const matchesSearch = !searchQuery ||
      entry.reflection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return hasPicture && matchesSearch;
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

  return (
      <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="backdrop-blur-lg" style={{ 
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="px-6 py-3">
          <h1 className="text-xl font-bold theme-text-primary mb-3">Journal</h1>

          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-9 text-sm rounded-xl theme-card"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 justify-start">
             {filters.map((filter) => {
               const Icon = filter.icon;
               return (
                 <button
                   key={filter.id}
                   onClick={() => setActiveFilter(filter.id)}
                   className={cn(
                     "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border-2",
                     activeFilter === filter.id
                       ? "border-current theme-text-primary"
                       : "border-transparent theme-card theme-text-secondary hover:shadow-md"
                   )}
                 >
                   {Icon && <Icon className="w-3.5 h-3.5" />}
                   {filter.label}
                 </button>
               );
             })}
           </div>
        </div>
        </div>

      {/* Entries */}
      <div className="px-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : activeFilter === 'pictures' ? (
           pictureEntries.length > 0 ? (
             <div className="grid grid-cols-2 gap-3">
               {pictureEntries.map((entry) => (
                 <motion.button
                   key={entry.id}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   onClick={() => navigate(createPageUrl('JournalEntryDetail') + `?id=${entry.id}`)}
                   className="relative overflow-hidden rounded-2xl aspect-square group"
                 >
                   <img 
                     src={entry.photo_url} 
                     alt="Moment" 
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                   />
                   <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                     <p className="text-white text-xs text-center px-2 line-clamp-2">
                       {entry.reflection?.substring(0, 30)}...
                     </p>
                   </div>
                 </motion.button>
               ))}
             </div>
           ) : (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-16"
             >
               <Image className="w-16 h-16 theme-text-secondary mx-auto mb-3" />
               <h3 className="font-semibold theme-text-primary mb-1">No pictures yet</h3>
               <p className="text-sm theme-text-secondary">Capture a moment with a photo</p>
             </motion.div>
           )
        ) : activeFilter === 'favorites' ? (
           filteredFavorites.length > 0 ? (
             <div className="space-y-3">
               {filteredFavorites.map((entry) => (
                 <JournalEntryCard 
                   key={entry.id} 
                   entry={entry}
                   onClick={() => navigate(createPageUrl('JournalEntryDetail') + `?id=${entry.id}`)}
                   showFavorite={true}
                   onFavoriteToggle={async (e) => {
                     e.stopPropagation();
                     await base44.entities.JournalEntry.update(entry.id, {
                       is_favorite: !entry.is_favorite
                     });
                     refetch();
                   }}
                 />
               ))}
             </div>
           ) : (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-16"
             >
               <Star className="w-16 h-16 theme-text-secondary mx-auto mb-3" />
               <h3 className="font-semibold theme-text-primary mb-1">No favorite entries yet</h3>
               <p className="text-sm theme-text-secondary">Tap the star on journal entries to save favorites</p>
             </motion.div>
           )
        ) : Object.keys(groupedEntries).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dayEntries]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 theme-text-secondary" />
                  <h3 className="text-sm font-medium theme-text-secondary">
                    {format(new Date(dayEntries[0].created_date), 'EEEE, MMMM d')}
                  </h3>
                </div>
                <div className="space-y-3">
                  {dayEntries.map((entry) => (
                    <JournalEntryCard 
                      key={entry.id} 
                      entry={entry}
                      onClick={() => navigate(createPageUrl('JournalEntryDetail') + `?id=${entry.id}`)}
                      showFavorite={true}
                      onFavoriteToggle={async (e) => {
                        e.stopPropagation();
                        await base44.entities.JournalEntry.update(entry.id, {
                          is_favorite: !entry.is_favorite
                        });
                        refetch();
                      }}
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
            <h3 className="font-semibold theme-text-primary mb-1">
              {searchQuery ? 'No matches found' : 'No entries yet'}
            </h3>
            <p className="text-sm theme-text-secondary">
              {searchQuery ? 'Try a different search term' : 'Start capturing God moments'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}