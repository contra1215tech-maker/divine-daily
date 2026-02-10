import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Calendar, Camera, Heart, TrendingUp, Star, Plus, Image, Folder, FolderOpen, Edit2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

const filters = [
  { id: 'entries', label: 'Entries', icon: Camera },
  { id: 'pictures', label: 'Pictures', icon: Image },
  { id: 'favorites', label: 'Favorites', icon: Star },
];

export default function Journal() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('entries');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(console.error);
    }, []);

  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date'),
  });

  const { data: folders = [], refetch: refetchFolders } = useQuery({
    queryKey: ['journal-folders'],
    queryFn: () => base44.entities.JournalFolder.list('name'),
  });

  // Filter entries
  const filteredEntries = (activeFilter === 'favorites' || activeFilter === 'pictures') ? [] : entries.filter(entry => {
      const matchesSearch = !searchQuery || 
          entry.reflection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFolder = selectedFolder === null || 
        (selectedFolder === 'unfiled' ? !entry.folder_id : entry.folder_id === selectedFolder);
      
      return matchesSearch && matchesFolder;
  });

  const filteredFavorites = activeFilter === 'favorites' ? entries.filter(entry => {
    const isFavorite = entry.is_favorite === true;
    const matchesSearch = !searchQuery ||
      entry.reflection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder === null || 
      (selectedFolder === 'unfiled' ? !entry.folder_id : entry.folder_id === selectedFolder);
    return isFavorite && matchesSearch && matchesFolder;
  }) : [];

  const pictureEntries = activeFilter === 'pictures' ? entries.filter(entry => {
    const hasPicture = entry.photo_url && entry.type === 'moment';
    const matchesSearch = !searchQuery ||
      entry.reflection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder === null || 
      (selectedFolder === 'unfiled' ? !entry.folder_id : entry.folder_id === selectedFolder);
    return hasPicture && matchesSearch && matchesFolder;
  }) : [];

  // Group by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = format(new Date(entry.created_date), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {});

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await base44.entities.JournalFolder.create({ name: newFolderName });
    setNewFolderName('');
    setShowCreateFolder(false);
    refetchFolders();
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Delete this folder? Entries inside will become unfiled.')) {
      await base44.entities.JournalFolder.delete(folderId);
      if (selectedFolder === folderId) setSelectedFolder(null);
      refetchFolders();
    }
  };

  const unfiledCount = entries.filter(e => !e.folder_id).length;

  return (
      <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="backdrop-blur-lg" style={{ 
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold theme-text-primary">Journal</h1>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="p-2 rounded-xl theme-card hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4 theme-text-primary" />
            </button>
          </div>

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

          {/* Folders */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
            <button
              onClick={() => setSelectedFolder(null)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border-2",
                selectedFolder === null
                  ? "border-current theme-text-primary"
                  : "border-transparent theme-card theme-text-secondary hover:shadow-md"
              )}
            >
              <Folder className="w-3.5 h-3.5" />
              All
            </button>
            <button
              onClick={() => setSelectedFolder('unfiled')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border-2",
                selectedFolder === 'unfiled'
                  ? "border-current theme-text-primary"
                  : "border-transparent theme-card theme-text-secondary hover:shadow-md"
              )}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Unfiled ({unfiledCount})
            </button>
            {folders.map((folder) => {
              const count = entries.filter(e => e.folder_id === folder.id).length;
              return (
                <div key={folder.id} className="relative group">
                  <button
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border-2",
                      selectedFolder === folder.id
                        ? "border-current theme-text-primary"
                        : "border-transparent theme-card theme-text-secondary hover:shadow-md"
                    )}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    {folder.name} ({count})
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
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

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="theme-card">
          <DialogHeader>
            <DialogTitle className="theme-text-primary">Create New Folder</DialogTitle>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="theme-card"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}