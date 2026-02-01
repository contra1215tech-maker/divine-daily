import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Filter, Calendar, Camera, Heart, TrendingUp, Star, Plus, ChevronDown, Image } from 'lucide-react';
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
    const [showFilters, setShowFilters] = useState(false);

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
  const filteredEntries = (activeFilter === 'favorites' || activeFilter === 'pictures') ? [] : entries.filter(entry => {
      const matchesSearch = !searchQuery || 
          entry.reflection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
  });

  const filteredFavorites = activeFilter === 'favorites' ? favorites.filter(fav => {
    const matchesSearch = !searchQuery ||
      fav.verse_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
      <div className="sticky top-0 backdrop-blur-lg z-10" style={{ 
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="px-6 pt-3 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold theme-text-primary">Journal</h1>
            <button
              onClick={() => navigate(createPageUrl('CaptureMoment'))}
              className="w-10 h-10 rounded-full border-2 theme-text-primary flex items-center justify-center"
              style={{ borderColor: 'var(--text-light)' }}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries, verses, tags..."
              className="pl-12 rounded-2xl theme-card"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
        </div>

        {/* Filters Toggle */}
        <div className="px-6 pb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium theme-card theme-text-secondary"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {filters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border-2",
                          activeFilter === filter.id
                            ? "border-current theme-text-primary"
                            : "border-transparent theme-card theme-text-secondary hover:shadow-md"
                        )}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>

      {/* Weekly Summary */}
      <div className="px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl theme-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 theme-text-primary" />
            <span className="text-sm font-medium theme-text-primary">This Week</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 theme-text-primary" />
            <span className="text-2xl font-bold theme-text-primary">{weeklyMoments}</span>
            <span className="text-sm theme-text-secondary">entries this week</span>
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
        ) : activeFilter === 'pictures' ? (
           pictureEntries.length > 0 ? (
             <div className="grid grid-cols-2 gap-3">
               {pictureEntries.map((entry) => (
                 <motion.button
                   key={entry.id}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   onClick={() => {}}
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
               {filteredFavorites.map((fav) => (
                 <motion.div
                   key={fav.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="rounded-2xl p-4 theme-card"
                 >
                   <div className="flex items-start gap-3">
                     <Star className="w-5 h-5 theme-text-primary flex-shrink-0 mt-1" />
                     <div className="flex-1">
                       <h3 className="font-semibold theme-text-primary mb-2">{fav.verse_reference}</h3>
                       <p 
                         className="leading-relaxed font-serif theme-text-primary"
                         style={fav.highlight_color ? { 
                           backgroundColor: fav.highlight_color,
                           padding: '2px 4px',
                           borderRadius: '4px'
                         } : {}}
                       >
                         {fav.verse_text}
                       </p>
                       <p className="text-xs theme-text-secondary mt-2">{fav.bible_version}</p>
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
               <Star className="w-16 h-16 theme-text-secondary mx-auto mb-3" />
               <h3 className="font-semibold theme-text-primary mb-1">No favorite verses yet</h3>
               <p className="text-sm theme-text-secondary">Tap verses in the Bible to save favorites</p>
             </motion.div>
           )
        ) : Object.keys(groupedEntries).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dayEntries]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 theme-text-secondary" />
                  <h3 className="text-sm font-medium theme-text-secondary">
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