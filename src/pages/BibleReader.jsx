import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Settings2, Loader2, MessageSquare, Database, Star, Copy, Palette, MessageCircle, Bookmark as BookmarkIcon, X } from 'lucide-react';
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
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        base44.auth.me().then(async (userData) => {
            console.log('User data loaded:', userData);
            setUser(userData);
            
            // Set translation ID - only use BSB (ESV API is unavailable)
            const translation = 'BSB';
            console.log('Setting translation to:', translation);
            setTranslationId(translation);
            
            // Load saved reading position if no URL params
            const urlParams = new URLSearchParams(window.location.search);
            const hasUrlParams = urlParams.get('book_id');
            
            if (!hasUrlParams && userData.reading_position && userData.reading_position.book_id) {
                const { book_id, book_name, chapter, numberOfChapters } = userData.reading_position;
                setSelectedBook({ id: book_id, name: book_name, numberOfChapters });
                setSelectedChapter(chapter);
                setShowBookSelector(false);
            }
        }).catch((e) => {
            console.error('Auth error:', e);
        });
        
        // Load bookmarks
        base44.entities.Bookmark.list().then(setBookmarks).catch((e) => {
            console.error('Bookmarks error:', e);
        });
    }, []);

    // Separate effect to handle URL params navigation from favorites
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlBookId = urlParams.get('book_id');
        const urlBookName = urlParams.get('book_name');
        const urlChapter = urlParams.get('chapter');

        if (urlBookId && urlBookName && urlChapter) {
            setSelectedBook({ id: urlBookId, name: decodeURIComponent(urlBookName), numberOfChapters: 150 });
            setSelectedChapter(parseInt(urlChapter));
            setShowBookSelector(false);
            setActiveTab('text');
        }
    }, [window.location.search]);

    // Auto-save reading position whenever viewing a chapter
    useEffect(() => {
        if (selectedBook && selectedChapter && !showBookSelector) {
            saveReadingPosition(selectedBook, selectedChapter);
        }
    }, [selectedBook, selectedChapter, showBookSelector]);

    // Fetch books for selected translation
    const { data: booksData, isLoading: booksLoading, error: booksError } = useQuery({
        queryKey: ['bible-books', translationId],
        queryFn: async () => {
            const response = await base44.functions.invoke('getBibleBooks', { 
                translation_id: translationId 
            });
            console.log('Books response:', response.data);
            return response.data;
        },
        enabled: !!translationId,
    });

    // Map to books array if available
    const books = booksData?.books || [];
    
    useEffect(() => {
        console.log('booksData updated:', booksData);
        console.log('books array:', books);
        console.log('booksLoading:', booksLoading);
        console.log('booksError:', booksError);
    }, [booksData, books, booksLoading, booksError]);

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

    // Fetch user comments for chapter
    const { data: userComments, refetch: refetchComments } = useQuery({
        queryKey: ['verse-comments', selectedBook?.id, selectedChapter],
        queryFn: async () => {
            return await base44.entities.VerseComment.filter({
                book_id: selectedBook.id,
                chapter: selectedChapter
            });
        },
        enabled: !!selectedBook && !!selectedChapter,
    });

    // Get comments for a specific verse
    const getVerseComments = (verseNumber) => {
        if (!userComments) return [];
        return userComments.filter(c => c.verse_number === verseNumber);
    };

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
        // Don't auto-close book selector, wait for chapter selection
    };

    const handleChapterSelect = (chapter) => {
        setSelectedChapter(chapter);
        setActiveTab('text');
        setShowBookSelector(false);
        saveReadingPosition(selectedBook, chapter);
    };

    const saveReadingPosition = async (book, chapter) => {
        if (!book || !chapter) return;
        await base44.auth.updateMe({
            reading_position: {
                book_id: book.id,
                book_name: book.name,
                chapter: chapter,
                numberOfChapters: book.numberOfChapters
            }
        });
    };

    const handlePrevChapter = () => {
        if (selectedChapter > 1) {
            const newChapter = selectedChapter - 1;
            setSelectedChapter(newChapter);
            saveReadingPosition(selectedBook, newChapter);
        }
    };

    const handleNextChapter = () => {
        if (selectedChapter < selectedBook?.numberOfChapters) {
            const newChapter = selectedChapter + 1;
            setSelectedChapter(newChapter);
            saveReadingPosition(selectedBook, newChapter);
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
        refetchComments();
    };

    const handleDeleteComment = async (commentId) => {
        await base44.entities.VerseComment.delete(commentId);
        refetchComments();
    };

    const handleAddBookmark = async () => {
        const existing = bookmarks.find(b => 
            b.book_id === selectedBook.id && b.chapter === selectedChapter
        );
        
        if (existing) return; // Already bookmarked

        const newBookmark = await base44.entities.Bookmark.create({
            book_id: selectedBook.id,
            book_name: selectedBook.name,
            chapter: selectedChapter
        });

        setBookmarks([...bookmarks, newBookmark]);
    };

    const handleDeleteBookmark = async (bookmarkId) => {
        await base44.entities.Bookmark.delete(bookmarkId);
        setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    };

    const handleGoToBookmark = (bookmark) => {
        setSelectedBook({
            id: bookmark.book_id,
            name: bookmark.book_name,
            numberOfChapters: selectedBook?.numberOfChapters || 150
        });
        setSelectedChapter(bookmark.chapter);
        setShowBookSelector(false);
        setShowBookmarks(false);
        saveReadingPosition({ id: bookmark.book_id, name: bookmark.book_name }, bookmark.chapter);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '0ms' }} />
                    <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '150ms' }} />
                    <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '300ms' }} />
                </div>
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
                                {user?.theme === 'morning_dew' ? (
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/9db0b6a60_Screenshot2026-02-02at93125PM.png"
                                        alt="Bible"
                                        className="w-5 h-5 object-cover rounded"
                                    />
                                ) : user?.theme === 'eternal_hope' ? (
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/eb2f5728e_Screenshot2026-02-02at94127PM.png"
                                        alt="Bible"
                                        className="w-5 h-5 object-cover rounded"
                                    />
                                ) : (
                                    <BookOpen className="w-5 h-5 theme-text-primary" />
                                )}
                                <h1 className="text-xl font-bold theme-text-primary">Bible</h1>
                            </div>
                        )}


                    </div>

                    {selectedBook && !showBookSelector && (
                        <div className="mt-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold theme-text-primary">
                                {selectedBook.name} {selectedChapter}
                            </h2>
                            <div className="relative">
                                <button
                                    onClick={() => setShowBookmarks(!showBookmarks)}
                                    className="p-2 rounded-xl theme-text-primary"
                                >
                                    <BookmarkIcon className="w-5 h-5" />
                                </button>

                                {/* Bookmarks Dropdown */}
                                <AnimatePresence>
                                    {showBookmarks && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-40 bg-black/50"
                                                onClick={() => setShowBookmarks(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 top-full mt-2 w-72 rounded-3xl p-4 z-50 max-h-96 overflow-y-auto bg-white"
                                                style={{ 
                                                    border: '1px solid var(--border-color)',
                                                    boxShadow: 'var(--shadow-lg)'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-sm font-bold theme-text-primary">Bookmarks</h3>
                                                    <button
                                                        onClick={handleAddBookmark}
                                                        disabled={bookmarks.some(b => b.book_id === selectedBook.id && b.chapter === selectedChapter)}
                                                        className="text-xs theme-text-secondary hover:theme-text-primary disabled:opacity-30"
                                                    >
                                                        + Add Current
                                                    </button>
                                                </div>
                                                
                                                {bookmarks.length === 0 ? (
                                                    <p className="text-xs text-center theme-text-secondary py-4">
                                                        No bookmarks yet
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {bookmarks.map((bookmark) => (
                                                            <div
                                                                key={bookmark.id}
                                                                className="p-3 rounded-2xl theme-card flex items-center justify-between"
                                                            >
                                                                <button
                                                                    onClick={() => handleGoToBookmark(bookmark)}
                                                                    className="flex-1 text-left"
                                                                >
                                                                    <p className="text-sm font-medium theme-text-primary">
                                                                        {bookmark.book_name} {bookmark.chapter}
                                                                    </p>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteBookmark(bookmark.id)}
                                                                    className="p-1 rounded opacity-30 hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="w-3 h-3 theme-text-secondary" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="py-2">
                <AnimatePresence mode="wait">
                    {showBookSelector ? (
                        <motion.div
                            key="book-selector"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {booksLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '0ms' }} />
                                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '150ms' }} />
                                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            ) : booksError ? (
                                <div className="flex items-center justify-center py-12 text-red-500">
                                    <p>Error loading books: {booksError?.message || 'Unknown error'}</p>
                                </div>
                            ) : !books || books.length === 0 ? (
                                <div className="flex items-center justify-center py-12 text-slate-500">
                                    <p>No books found</p>
                                </div>
                            ) : (
                                <BookSelector
                                    books={books}
                                    onSelectBook={handleBookSelect}
                                    onChapterSelect={handleChapterSelect}
                                />
                            )}
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
                                               className="w-14 h-14 rounded-full border theme-text-primary flex items-center justify-center backdrop-blur-xl transition-all hover:scale-105"
                                               style={{ 
                                                   borderColor: 'var(--border-color)', 
                                                   backgroundColor: 'var(--card-bg)',
                                                   boxShadow: 'var(--shadow-lg)'
                                               }}
                                           >
                                               <ChevronLeft className="w-5 h-5" />
                                           </button>
                                        )}
                                        {selectedChapter < selectedBook.numberOfChapters && (
                                           <button
                                               onClick={handleNextChapter}
                                               className="w-14 h-14 rounded-full border theme-text-primary flex items-center justify-center backdrop-blur-xl transition-all hover:scale-105"
                                               style={{ 
                                                   borderColor: 'var(--border-color)', 
                                                   backgroundColor: 'var(--card-bg)',
                                                   boxShadow: 'var(--shadow-lg)'
                                               }}
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
                                       className="fixed bottom-16 left-4 right-4 z-50 rounded-3xl p-4 max-w-md mx-auto backdrop-blur-xl border"
                                       style={{ 
                                           backgroundColor: 'var(--card-bg)',
                                           borderColor: 'var(--border-color)',
                                           boxShadow: 'var(--shadow-lg)'
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
                                                                  className="w-10 h-10 rounded-full shadow-md transition-all flex-shrink-0 cursor-pointer"
                                                                  style={{ 
                                                                      backgroundColor: color,
                                                                      border: isActive ? '3px solid #1e293b' : '2px solid rgba(100, 116, 139, 0.3)',
                                                                      boxShadow: isActive ? '0 0 0 3px rgba(30, 41, 59, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.08)'
                                                                  }}
                                                              />
                                                          );
                                                      })}
                                                  </div>

                                                   {/* Action Buttons */}
                                                   <div className="grid grid-cols-2 gap-1.5">
                                                       <button
                                                           onClick={handleCopy}
                                                           className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl font-medium theme-text-primary border"
                                                           style={{ borderColor: 'var(--text-light)', backgroundColor: 'transparent' }}
                                                       >
                                                           <Copy className="w-4 h-4" />
                                                           <span className="text-[10px]">Copy</span>
                                                       </button>
                                                       <button
                                                           onClick={handleComment}
                                                           className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl font-medium theme-text-primary border"
                                                           style={{ borderColor: 'var(--text-light)', backgroundColor: 'transparent' }}
                                                       >
                                                           <MessageCircle className="w-4 h-4" />
                                                           <span className="text-[10px]">Comment</span>
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
                                                   {/* Existing Comments */}
                                                   {getVerseComments(selectedVerse.number).length > 0 && (
                                                       <div className="space-y-2 mb-3">
                                                           <p className="text-xs font-medium theme-text-secondary">Your Comments:</p>
                                                           {getVerseComments(selectedVerse.number).map((comment) => (
                                                               <div 
                                                                   key={comment.id}
                                                                   className="p-3 rounded-2xl theme-card relative group"
                                                               >
                                                                   <p className="text-sm theme-text-primary pr-6">
                                                                       {comment.comment}
                                                                   </p>
                                                                   <button
                                                                       onClick={() => handleDeleteComment(comment.id)}
                                                                       className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                                                                       style={{ color: 'var(--text-light)' }}
                                                                   >
                                                                       <X className="w-3 h-3" />
                                                                   </button>
                                                               </div>
                                                           ))}
                                                       </div>
                                                   )}

                                                   <textarea
                                                       value={commentText}
                                                       onChange={(e) => setCommentText(e.target.value)}
                                                       placeholder="Add another comment..."
                                                       className="w-full p-4 rounded-2xl border resize-none theme-text-primary"
                                                       rows={4}
                                                       style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-overlay)' }}
                                                   />
                                                   <div className="flex gap-2">
                                                       <button
                                                           onClick={handleSaveComment}
                                                           className="flex-1 py-2.5 rounded-2xl font-medium border theme-text-primary"
                                                           style={{ borderColor: 'var(--text-light)', backgroundColor: 'transparent' }}
                                                       >
                                                           Save Comment
                                                       </button>
                                                       <button
                                                           onClick={() => {
                                                               setShowCommentInput(false);
                                                               setCommentText('');
                                                           }}
                                                           className="flex-1 py-2.5 rounded-2xl font-medium theme-text-secondary border"
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
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-4">
                                <TabsList className="grid w-full grid-cols-3 border rounded-3xl p-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                    <TabsTrigger value="text" className="rounded-2xl data-[state=active]:shadow-sm text-xs px-2 py-2">
                                        <BookOpen className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">Text</span>
                                        <span className="sm:hidden">Text</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="commentary" className="rounded-2xl data-[state=active]:shadow-sm text-xs px-2 py-2">
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">Commentary</span>
                                        <span className="sm:hidden">Notes</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="references" className="rounded-2xl data-[state=active]:shadow-sm text-xs px-2 py-2">
                                        <Database className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">References</span>
                                        <span className="sm:hidden">Refs</span>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="text" className="mt-4">
                                    {chapterLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '0ms' }} />
                                                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '150ms' }} />
                                                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    ) : chapterData?.chapter?.content ? (
                                        <div className="px-4 py-6">
                                            <div className="space-y-4">
                                                {chapterData.chapter.content
                                                    .filter(item => item.type === 'verse')
                                                    .map((verse) => {
                                                        const verseKey = `${selectedBook.id}-${selectedChapter}-${verse.number}`;
                                                        const highlightColor = verseHighlights[verseKey];
                                                        const isSelected = selectedVerse?.key === verseKey;
                                                        const hasComments = getVerseComments(verse.number).length > 0;

                                                        return (
                                                            <div 
                                                                key={verse.number} 
                                                                className="flex gap-3 cursor-pointer"
                                                                onClick={(e) => handleVerseClick(verse, e)}
                                                            >
                                                                <div className="flex items-start gap-1 flex-shrink-0">
                                                                    <span className="text-sm font-bold text-sky-500 mt-1">
                                                                        {verse.number}
                                                                    </span>
                                                                    {hasComments && (
                                                                        <div 
                                                                            className="w-1.5 h-1.5 rounded-full mt-2"
                                                                            style={{ backgroundColor: 'var(--accent-primary)' }}
                                                                        />
                                                                    )}
                                                                </div>
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
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '0ms' }} />
                                                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '150ms' }} />
                                                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* User Comments */}
                                            {userComments && userComments.length > 0 && (
                                                <div className="rounded-3xl p-6 mx-4 theme-card">
                                                    <h3 className="text-sm font-bold theme-text-primary mb-4 flex items-center gap-2">
                                                        <MessageCircle className="w-4 h-4" />
                                                        My Comments
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {userComments.map((comment) => {
                                                            const verse = chapterData?.chapter?.content?.find(
                                                                v => v.type === 'verse' && v.number === comment.verse_number
                                                            );
                                                            const verseText = verse ? (
                                                                Array.isArray(verse.content) 
                                                                    ? verse.content.map(item => 
                                                                        typeof item === 'string' ? item : item.text || ''
                                                                    ).join(' ')
                                                                    : verse.content
                                                            ) : '';

                                                            return (
                                                                <div key={comment.id} className="space-y-2 pb-4 border-b last:border-b-0 relative group" style={{ borderColor: 'var(--border-color)' }}>
                                                                    <span className="text-sm font-bold text-sky-600">
                                                                        Verse {comment.verse_number}
                                                                    </span>
                                                                    {verseText && (
                                                                        <p className="text-sm italic theme-text-secondary leading-relaxed">
                                                                            "{verseText}"
                                                                        </p>
                                                                    )}
                                                                    <p className="text-slate-700 leading-relaxed pr-6">
                                                                        {comment.comment}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        className="absolute top-0 right-0 p-1 rounded opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                                                                        style={{ color: 'var(--text-light)' }}
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bible Commentary */}
                                            {commentaryData && (
                                                <div className="rounded-3xl p-6 mx-4 theme-card">
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
                                                <div className="rounded-3xl p-6 mx-4 theme-card text-center text-slate-500">
                                                    No commentary available for this chapter
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="references" className="mt-4">
                                    {datasetLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '0ms' }} />
                                                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '150ms' }} />
                                                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    ) : datasetData ? (
                                        <div className="rounded-3xl p-6 mx-4 theme-card">
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
                                        <div className="rounded-3xl p-6 mx-4 theme-card text-center text-slate-500">
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