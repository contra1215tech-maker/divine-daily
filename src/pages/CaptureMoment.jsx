import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Sparkles, Tag, X } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PhotoCapture from '@/components/capture/PhotoCapture';
import VerseCard from '@/components/ui/VerseCard';
import Celebration from '@/components/ui/Celebration';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const suggestedTags = ['Creation', 'Grace', 'Provision', 'Peace', 'Love', 'Joy', 'Guidance', 'Community'];

export default function CaptureMoment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [reflection, setReflection] = useState('');
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [verse, setVerse] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
    base44.entities.JournalFolder.list('name').then(setFolders).catch(console.error);
  }, []);

  const createEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['recent-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      
      // Update user stats
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const lastEntry = user.last_entry_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak = user.current_streak || 0;
        if (lastEntry === yesterday) {
          newStreak += 1;
        } else if (lastEntry !== today) {
          newStreak = 1;
        }
        
        await base44.auth.updateMe({
          total_moments: (user.total_moments || 0) + 1,
          current_streak: newStreak,
          longest_streak: Math.max(user.longest_streak || 0, newStreak),
          last_entry_date: today,
        });
      }
      
      setShowCelebration(true);
    },
  });

  const fetchVerse = async () => {
    if (!reflection) return;
    
    setLoadingVerse(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this reflection about seeing God at work: "${reflection}"
        
        Provide a relevant Bible verse that connects to this theme. Return JSON with:
        - verse_text: The actual verse text (2-3 verses max)
        - verse_reference: The reference (e.g., "Psalm 19:1")
        
        Choose a verse that is encouraging and connects to the theme of the reflection.`,
        response_json_schema: {
          type: "object",
          properties: {
            verse_text: { type: "string" },
            verse_reference: { type: "string" }
          }
        }
      });
      
      setVerse({
        text: result.verse_text,
        reference: result.verse_reference,
        version: user?.preferred_bible_version || 'NIV'
      });
    } catch (error) {
      console.error('Failed to fetch verse:', error);
    }
    setLoadingVerse(false);
  };

  const handleAddTag = (tag) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      handleAddTag(customTag.trim());
      setCustomTag('');
    }
  };

  const handleSave = async () => {
    if (!reflection && !photo) return;
    
    setSaving(true);
    await createEntryMutation.mutateAsync({
      type: 'moment',
      photo_url: photo,
      reflection,
      verse_text: verse?.text,
      verse_reference: verse?.reference,
      bible_version: verse?.version || user?.preferred_bible_version || 'NIV',
      tags,
      folder_id: selectedFolder,
    });
    setSaving(false);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    navigate(createPageUrl('BibleReader'));
  };

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
    <Celebration type="confetti" show={showCelebration} onComplete={handleCelebrationComplete} />

    <div className="px-6 pt-6 pb-32 space-y-6">
      {/* Reflection - Main Focus */}
      <div className="space-y-3">
        <label className="text-2xl font-bold theme-text-primary">
          I saw God in...
        </label>
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Describe what you noticed..."
          className="min-h-[200px] text-base rounded-2xl theme-card resize-none dark-mode-text"
          style={{ borderColor: 'var(--border-color)' }}
        />
      </div>

      {/* Photo Capture - Small Option */}
      <div className="space-y-2">
        <label className="text-sm font-medium theme-text-secondary">
          Add a photo (optional)
        </label>
        <PhotoCapture 
          photo={photo}
          onPhotoCapture={setPhoto}
          onRemove={() => setPhoto(null)}
        />
      </div>

        {/* Get Verse Button */}
        {reflection && !verse && (
          <AnimatedButton
            variant="secondary"
            onClick={fetchVerse}
            loading={loadingVerse}
            icon={Sparkles}
            className="w-full"
          >
            Find a verse for this moment
          </AnimatedButton>
        )}

        {/* Verse Display */}
        {verse && (
          <VerseCard
            verse={verse.text}
            reference={verse.reference}
            version={verse.version}
            onRefresh={fetchVerse}
            loading={loadingVerse}
          />
        )}

        {/* Folder Selection */}
        {folders.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium theme-text-secondary">
              Save to folder (optional)
            </label>
            <select
              value={selectedFolder || ''}
              onChange={(e) => setSelectedFolder(e.target.value || null)}
              className="w-full p-3 rounded-xl theme-card theme-text-primary border"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}
            >
              <option value="">Unfiled</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 theme-text-secondary" />
            <label className="text-sm font-medium theme-text-primary">Tags</label>
          </div>
          
          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <motion.button
                  key={tag}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => handleRemoveTag(tag)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2 theme-text-primary text-sm font-medium"
                  style={{ borderColor: 'var(--text-light)' }}
                >
                  #{tag}
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              ))}
            </div>
          )}
          
          {/* Suggested Tags */}
          <div className="flex flex-wrap gap-2">
            {suggestedTags.filter(t => !tags.includes(t)).map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="px-3 py-1.5 rounded-full theme-card theme-text-secondary text-sm hover:shadow-md transition-all"
              >
                #{tag}
              </button>
            ))}
          </div>
          
          {/* Custom Tag Input */}
          <div className="flex gap-2">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Add custom tag..."
              className="rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
            />
            <AnimatedButton
              variant="secondary"
              size="small"
              onClick={handleAddCustomTag}
              disabled={!customTag.trim()}
            >
              Add
            </AnimatedButton>
          </div>
        </div>

        {/* Save Button */}
        <AnimatedButton
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={!reflection && !photo}
          className="w-full"
        >
          Save This Moment ✨
        </AnimatedButton>
      </div>
    </div>
  );
}