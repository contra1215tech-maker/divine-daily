import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Settings2, Loader2, MessageSquare, Database, Star, Copy, Palette, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import BookSelector from '../components/bible/BookSelector';
import ChapterSelector from '../components/bible/ChapterSelector';
import { cn } from "@/lib/utils";

export default function BibleReader() {
    const [user, setUser] = useState(null);
    const [translationId, setTranslationId] = useState('BSB');
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [showBookSelector, setShowBookSelector] = useState(true);
    const [activeTab, setActiveTab] = useState('text');
    const [showNavControls, setShowNavControls] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState(null);
    const [verseHighlights, setVerseHighlights] = useState({});
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [favoritedVerses, setFavoritedVerses] = useState(new Set());

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
        // Load favorited verses
        base44.entities.FavoriteVerse.list().then(favs => {
            const favSet = new Set(favs.map(f => f.verse_reference));
            setFavoritedVerses(favSet);
        }).catch(() => {});
    }, []);

    // Fetch books for selected translation
    const { data: booksData, isLoading: booksLoading } = useQuery({
        queryKey: ['bible-books', translationId],
        queryFn: async () => {
            const response = await base44.functions.invoke('getBibleBooks', { 
                translation_id: translationId 
            });
            return response.data;
        },
        enabled: !!translationId,
    });

    // Fetch chapter content
    const { data: chapterData, isLoading: chapterLoading } = useQuery({
        queryKey: ['bible-chapter', translationId, selectedBook?.id, selectedChapter],
        queryFn: async () => {
            const response = await base44.functions.invoke('getBibleChapter', {
                translation_id: translationId,
                book_id: selectedBook.id,
                chapter: selectedChapter
            });
            return response.data;
        },
        enabled: !!selectedBook && !!selectedChapter && !showBookSelector,
    });

    // Fetch commentary
    const { data: commentaryData, isLoading: commentaryLoading } = useQuery({
        queryKey: ['bible-commentary', 'mhcc', selectedBook?.id, selectedChapter],
        queryFn: async () => {
            const response = await base44.functions.invoke('getBibleCommentary', {
                commentary_id: 'mhcc',
                book_id: selectedBook.id,
                chapter: selectedChapter
            });
            return response.data;
        },
        enabled: !!selectedBook && !!selectedChapter && activeTab === 'commentary',
    });

    // Fetch user comments
    const { data: userComments } = useQuery({
        queryKey: ['verse-comments', selectedBook?.id, selectedChapter],
        queryFn: async () => {
            return await base44.entities.VerseComment.filter({
                book_id: selectedBook.id,
                chapter: selectedChapter
            });
        },
        enabled: !!selectedBook && !!selectedChapter && activeTab === 'commentary',
    });

    // Fetch dataset (cross-references)
    const { data: datasetData, isLoading: datasetLoading } = useQuery({
        queryKey: ['bible-dataset', 'cross_references', selectedBook?.id, selectedChapter],
        queryFn: async () => {
            const response = await base44.functions.invoke('getBibleDataset', {
                dataset_id: 'cross_references',
                book_id: selectedBook.id,
                chapter: selectedChapter
            });
            return response.data;
        },
        enabled: !!selectedBook && !!selectedChapter && activeTab === 'references',
    });

    const handleBookSelect = (book) => {
        setSelectedBook(book);
    };

    const handleChapterSelect = (chapter) => {
        setSelectedChapter(chapter);
        setActiveTab('text');
        setShowBookSelector(false);
    };

    const handlePrevChapter = () => {
        if (selectedChapter > 1) {
            setSelectedChapter(selectedChapter - 1);
        }
    };

    const handleNextChapter = () => {
        if (selectedChapter < selectedBook?.numberOfChapters) {
            setSelectedChapter(selectedChapter + 1);
        }
    };

    const toggleNavControls = () => {
        setShowNavControls(!showNavControls);
    };

    const handleVerseClick = (verse, e) => {
        e.stopPropagation();
        const verseKey = `${selectedBook.id}-${selectedChapter}-${verse.number}`;
        
        // Toggle: if clicking the same verse, deselect it
        if (selectedVerse?.key === verseKey) {
            setSelectedVerse(null);
        } else {
            setSelectedVerse({ ...verse, key: verseKey });
        }
    };

    const handleHighlight = async (color) => {
        const verseKey = selectedVerse.key;
        // Toggle: if same color, remove highlight
        if (verseHighlights[verseKey] === color) {
            const newHighlights = { ...verseHighlights };
            delete newHighlights[verseKey];
            setVerseHighlights(newHighlights);
        } else {
            setVerseHighlights({ ...verseHighlights, [verseKey]: color });
        }
        setSelectedVerse(null);
    };

    const handleFavorite = async () => {
        const verseRef = `${selectedBook.name} ${selectedChapter}:${selectedVerse.number}`;
        
        // Toggle: if already favorited, unfavorite
        if (favoritedVerses.has(verseRef)) {
            const favorites = await base44.entities.FavoriteVerse.filter({ verse_reference: verseRef });
            if (favorites.length > 0) {
                await base44.entities.FavoriteVerse.delete(favorites[0].id);
            }
            const newFavs = new Set(favoritedVerses);
            newFavs.delete(verseRef);
            setFavoritedVerses(newFavs);
        } else {
            const verseText = Array.isArray(selectedVerse.content)
                ? selectedVerse.content.map(item => typeof item === 'string' ? item : item.text || '').join(' ')
                : selectedVerse.content;

            await base44.entities.FavoriteVerse.create({
                verse_reference: verseRef,
                verse_text: verseText,
                book_name: selectedBook.name,
                chapter: selectedChapter,
                verse_number: selectedVerse.number,
                bible_version: translationId,
                highlight_color: verseHighlights[selectedVerse.key] || null
            });
            
            const newFavs = new Set(favoritedVerses);
            newFavs.add(verseRef);
            setFavoritedVerses(newFavs);
        }
        
        setSelectedVerse(null);
    };

    const handleCopy = () => {
        const verseText = Array.isArray(selectedVerse.content)
            ? selectedVerse.content.map(item => typeof item === 'string' ? item : item.text || '').join(' ')
            : selectedVerse.content;
        
        const fullText = `${selectedBook.name} ${selectedChapter}:${selectedVerse.number} - ${verseText}`;
        navigator.clipboard.writeText(fullText);
        setSelectedVerse(null);
    };

    const handleComment = () => {
        setShowCommentInput(true);
    };

    const handleSaveComment = async () => {
        if (!commentText.trim()) return;

        await base44.entities.VerseComment.create({
            book_id: selectedBook.id,
            book_name: selectedBook.name,
            chapter: selectedChapter,
            verse_number: selectedVerse.number,
            verse_reference: `${selectedBook.name} ${selectedChapter}:${selectedVerse.number}`,
            comment: commentText,
            bible_version: translationId
        });

        setCommentText('');
        setShowCommentInput(false);
        setSelectedVerse(null);
    };

    if (!user || booksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'transparent' }}>
            {/* Header */}
            <div className="backdrop-blur-md" style={{
                background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-gradient-from))',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        {selectedBook && !showBookSelector ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowBookSelector(true)}
                                className="gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Books
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 theme-text-primary" />
                                <h1 className="text-xl font-bold theme-text-primary">Bible</h1>
                            </div>
                        )}


                    </div>

                    {selectedBook && !showBookSelector && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold theme-text-primary">
                                {selectedBook.name} {selectedChapter}
                            </h2>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-2 py-2">
                <AnimatePresence mode="wait">
                    {showBookSelector ? (
                        <motion.div
                            key="book-selector"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <BookSelector
                                books={booksData?.books || []}
                                onSelectBook={handleBookSelect}
                                onChapterSelect={handleChapterSelect}
                            />
                        </motion.div>
                    ) : selectedBook ? (
                        <motion.div
                            key="chapter-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="relative"
                            onClick={toggleNavControls}
                        >
                            {/* Navigation Controls */}
                            <AnimatePresence>
                                {showNavControls && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="fixed bottom-16 left-0 right-0 z-40 flex justify-center gap-4 px-4 max-w-md mx-auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {selectedChapter > 1 && (
                                           <button
                                               onClick={handlePrevChapter}
                                               className="w-12 h-12 rounded-full border-2 theme-text-primary shadow-lg flex items-center justify-center backdrop-blur-lg"
                                               style={{ borderColor: 'var(--text-light)', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                                           >
                                               <ChevronLeft className="w-5 h-5" />
                                           </button>
                                        )}
                                        {selectedChapter < selectedBook.numberOfChapters && (
                                           <button
                                               onClick={handleNextChapter}
                                               className="w-12 h-12 rounded-full border-2 theme-text-primary shadow-lg flex items-center justify-center backdrop-blur-lg"
                                               style={{ borderColor: 'var(--text-light)', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                                           >
                                               <ChevronRight className="w-5 h-5" />
                                           </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Verse Actions Menu */}
                            <AnimatePresence>
                                {selectedVerse && (
                                    <motion.div
                                       initial={{ opacity: 0, y: 20 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       exit={{ opacity: 0, y: 20 }}
                                       className="fixed bottom-16 left-4 right-4 z-50 rounded-2xl shadow-2xl p-3 max-w-md mx-auto backdrop-blur-xl border-2"
                                       style={{ 
                                           backgroundColor: 'var(--card-bg)',
                                           borderColor: 'var(--border-color)'
                                       }}
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                       <h3 className="text-sm font-semibold mb-2 theme-text-primary">
                                           Verse {selectedVerse.number}
                                       </h3>

                                       <div className="space-y-2">
                                          {!showCommentInput ? (
                                              <>
                                                  {/* Highlight Colors */}
                                                  <div className="flex gap-1.5 justify-center">
                                                      {['#f8bbd0', '#e1bee7', '#c5cae9', '#bbdefb', '#b2dfdb', '#fff9c4'].map((color) => {
                                                          const verseKey = selectedVerse.key;
                                                          const isActive = verseHighlights[verseKey] === color;
                                                          return (
                                                              <div
                                                                  key={color}
                                                                  onClick={() => handleHighlight(color)}
                                                                  className="w-9 h-9 rounded-full shadow-md transition-all flex-shrink-0 cursor-pointer"
                                                                  style={{ 
                                                                      backgroundColor: color,
                                                                      border: isActive ? '3px solid #1e293b' : '2px solid #64748b',
                                                                      boxShadow: isActive ? '0 0 0 2px rgba(30, 41, 59, 0.2)' : 'none'
                                                                  }}
                                                              />
                                                          );
                                                      })}
                                                  </div>

                                                   {/* Action Buttons */}
                                                   <div className="grid grid-cols-3 gap-2">
                                                       <button
                                                           onClick={handleFavorite}
                                                           className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-medium border-2 theme-text-primary"
                                                           style={{ 
                                                               borderColor: favoritedVerses.has(`${selectedBook.name} ${selectedChapter}:${selectedVerse.number}`) ? '#f59e0b' : 'var(--text-light)',
                                                               backgroundColor: favoritedVerses.has(`${selectedBook.name} ${selectedChapter}:${selectedVerse.number}`) ? '#fef3c7' : 'transparent'
                                                           }}
                                                       >
                                                           <Star className={cn("w-5 h-5", favoritedVerses.has(`${selectedBook.name} ${selectedChapter}:${selectedVerse.number}`) && "fill-amber-500 text-amber-500")} />
                                                           <span className="text-xs">{favoritedVerses.has(`${selectedBook.name} ${selectedChapter}:${selectedVerse.number}`) ? 'Unfavorite' : 'Favorite'}</span>
                                                       </button>
                                                       <button
                                                           onClick={handleCopy}
                                                           className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-medium theme-text-primary border-2"
                                                           style={{ borderColor: 'var(--text-light)', backgroundColor: 'transparent' }}
                                                       >
                                                           <Copy className="w-5 h-5" />
                                                           <span className="text-xs">Copy</span>
                                                       </button>
                                                       <button
                                                           onClick={handleComment}
                                                           className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-medium theme-text-primary border-2"
                                                           style={{ borderColor: 'var(--text-light)', backgroundColor: 'transparent' }}
                                                       >
                                                           <MessageCircle className="w-5 h-5" />
                                                           <span className="text-xs">Comment</span>
                                                       </button>
                                                   </div>

                                                   <button
                                                       onClick={() => setSelectedVerse(null)}
                                                       className="w-full py-2 text-sm theme-text-secondary"
                                                   >
                                                       Cancel
                                                   </button>
                                               </>
                                           ) : (
                                               <>
                                                   <textarea
                                                       value={commentText}
                                                       onChange={(e) => setCommentText(e.target.value)}
                                                       placeholder="Write your comment..."
                                                       className="w-full p-3 rounded-xl border-2 resize-none theme-text-primary"
                                                       rows={4}
                                                       style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-overlay)' }}
                                                   />
                                                   <div className="flex gap-2">
                                                       <button
                                                           onClick={handleSaveComment}
                                                           className="flex-1 py-2 rounded-xl font-medium border-2 theme-text-primary"
                                                           style={{ borderColor: 'var(--text-light)', backgroundColor: 'transparent' }}
                                                       >
                                                           Save Comment
                                                       </button>
                                                       <button
                                                           onClick={() => {
                                                               setShowCommentInput(false);
                                                               setCommentText('');
                                                           }}
                                                           className="flex-1 py-2 rounded-xl font-medium theme-text-secondary border-2"
                                                           style={{ borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}
                                                       >
                                                           Cancel
                                                       </button>
                                                   </div>
                                               </>
                                           )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Chapter Content with Tabs */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 border border-slate-200 rounded-2xl p-1" style={{ backgroundColor: 'transparent' }}>
                                    <TabsTrigger value="text" className="rounded-xl">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Text
                                    </TabsTrigger>
                                    <TabsTrigger value="commentary" className="rounded-xl">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Commentary
                                    </TabsTrigger>
                                    <TabsTrigger value="references" className="rounded-xl">
                                        <Database className="w-4 h-4 mr-2" />
                                        References
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="text" className="mt-4">
                                    {chapterLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                        </div>
                                    ) : chapterData?.chapter?.content ? (
                                        <div className="rounded-3xl p-6">
                                            <div className="space-y-4">
                                                {chapterData.chapter.content
                                                    .filter(item => item.type === 'verse')
                                                    .map((verse) => {
                                                        const verseKey = `${selectedBook.id}-${selectedChapter}-${verse.number}`;
                                                        const highlightColor = verseHighlights[verseKey];
                                                        const isSelected = selectedVerse?.key === verseKey;
                                                        
                                                        return (
                                                            <div 
                                                                key={verse.number} 
                                                                className="flex gap-3 cursor-pointer"
                                                                onClick={(e) => handleVerseClick(verse, e)}
                                                            >
                                                                <span className="text-sm font-bold text-sky-500 mt-1 flex-shrink-0">
                                                                    {verse.number}
                                                                </span>
                                                                <p 
                                                                        className={cn(
                                                                            "text-slate-800 leading-relaxed transition-all",
                                                                            isSelected && "underline decoration-2",
                                                                            highlightColor && "px-1 rounded"
                                                                        )}
                                                                        style={highlightColor ? { backgroundColor: highlightColor } : {}}
                                                                    >
                                                                    {Array.isArray(verse.content) 
                                                                        ? verse.content.map(item => 
                                                                            typeof item === 'string' ? item : item.text || ''
                                                                        ).join(' ')
                                                                        : verse.content}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ) : null}
                                </TabsContent>

                                <TabsContent value="commentary" className="mt-4">
                                    {commentaryLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* User Comments */}
                                            {userComments && userComments.length > 0 && (
                                                <div className="rounded-3xl p-6 theme-card">
                                                    <h3 className="text-sm font-bold theme-text-primary mb-4 flex items-center gap-2">
                                                        <MessageCircle className="w-4 h-4" />
                                                        My Comments
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {userComments.map((comment) => (
                                                            <div key={comment.id} className="space-y-2 pb-4 border-b last:border-b-0" style={{ borderColor: 'var(--border-color)' }}>
                                                                <span className="text-sm font-bold text-sky-600">
                                                                    Verse {comment.verse_number}
                                                                </span>
                                                                <p className="text-slate-700 leading-relaxed">
                                                                    {comment.comment}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bible Commentary */}
                                            {commentaryData && (
                                                <div className="rounded-3xl p-6 border border-slate-200 theme-card">
                                                    <h3 className="text-sm font-bold text-amber-600 mb-4">Bible Commentary</h3>
                                                    <div className="space-y-4">
                                                        {commentaryData.verses?.map((verse) => (
                                                            <div key={verse.verse} className="space-y-2">
                                                                <span className="text-sm font-bold text-amber-600">
                                                                    Verse {verse.verse}
                                                                </span>
                                                                <p className="text-slate-700 leading-relaxed">
                                                                    {verse.text}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {!commentaryData && (!userComments || userComments.length === 0) && (
                                                <div className="rounded-3xl p-6 border border-slate-200 theme-card text-center text-slate-500">
                                                    No commentary available for this chapter
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="references" className="mt-4">
                                    {datasetLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                        </div>
                                    ) : datasetData ? (
                                        <div className="rounded-3xl p-6 border border-slate-200 theme-card">
                                            <div className="space-y-4">
                                                {datasetData.verses?.map((verse) => (
                                                    <div key={verse.verse} className="space-y-2">
                                                        <span className="text-sm font-bold text-purple-600">
                                                            Verse {verse.verse}
                                                        </span>
                                                        <div className="text-slate-700 leading-relaxed">
                                                            {verse.text}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl p-6 border border-slate-200 theme-card text-center text-slate-500">
                                            No cross-references available for this chapter
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}