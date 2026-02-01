import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Settings2, Loader2, MessageSquare, Database, Star, Copy, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import BookSelector from '../components/bible/BookSelector';
import ChapterSelector from '../components/bible/ChapterSelector';

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

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
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
        setSelectedVerse({ ...verse, key: verseKey });
    };

    const handleHighlight = async (color) => {
        const verseKey = selectedVerse.key;
        setVerseHighlights({ ...verseHighlights, [verseKey]: color });
        setSelectedVerse(null);
    };

    const handleFavorite = async () => {
        const verseText = Array.isArray(selectedVerse.content)
            ? selectedVerse.content.map(item => typeof item === 'string' ? item : item.text || '').join(' ')
            : selectedVerse.content;

        await base44.entities.FavoriteVerse.create({
            verse_reference: `${selectedBook.name} ${selectedChapter}:${selectedVerse.number}`,
            verse_text: verseText,
            book_name: selectedBook.name,
            chapter: selectedChapter,
            verse_number: selectedVerse.number,
            bible_version: translationId,
            highlight_color: verseHighlights[selectedVerse.key] || null
        });

        alert('Verse saved to favorites!');
        setSelectedVerse(null);
    };

    const handleCopy = () => {
        const verseText = Array.isArray(selectedVerse.content)
            ? selectedVerse.content.map(item => typeof item === 'string' ? item : item.text || '').join(' ')
            : selectedVerse.content;
        
        const fullText = `${selectedBook.name} ${selectedChapter}:${selectedVerse.number} - ${verseText}`;
        navigator.clipboard.writeText(fullText);
        alert('Verse copied to clipboard!');
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
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200">
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

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings2 className="w-5 h-5 theme-text-primary" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Bible Version</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 space-y-2">
                                    {['BSB', 'ENGWEBP'].map((id) => (
                                        <Button
                                            key={id}
                                            variant={translationId === id ? "default" : "outline"}
                                            className="w-full justify-start"
                                            onClick={() => {
                                                setTranslationId(id);
                                                setSelectedBook(null);
                                                setShowBookSelector(true);
                                            }}
                                        >
                                            {id === 'BSB' ? 'Berean Standard Bible' : 'World English Bible'}
                                        </Button>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
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

            <div className="px-4 py-6">
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
                                                className="w-12 h-12 rounded-full theme-button text-white shadow-lg flex items-center justify-center"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                        )}
                                        {selectedChapter < selectedBook.numberOfChapters && (
                                            <button
                                                onClick={handleNextChapter}
                                                className="w-12 h-12 rounded-full theme-button text-white shadow-lg flex items-center justify-center"
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
                                        className="fixed bottom-16 left-4 right-4 z-50 theme-card rounded-2xl shadow-2xl p-4 max-w-md mx-auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <h3 className="text-sm font-semibold mb-3 theme-text-primary">
                                            Verse {selectedVerse.number}
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            {/* Highlight Colors */}
                                            <div>
                                                <p className="text-xs mb-2 flex items-center gap-1 theme-text-secondary">
                                                    <Palette className="w-3 h-3" />
                                                    Highlight Color
                                                </p>
                                                <div className="flex gap-2">
                                                    {['#ffcdd2', '#f8bbd0', '#e1bee7', '#c5cae9', '#bbdefb', '#b2dfdb', '#fff9c4'].map((color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() => handleHighlight(color)}
                                                            className="w-8 h-8 rounded-full border-2 border-slate-300"
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleFavorite}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-medium theme-button text-white"
                                                >
                                                    <Star className="w-4 h-4" />
                                                    Favorite
                                                </button>
                                                <button
                                                    onClick={handleCopy}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-medium theme-card theme-text-primary border"
                                                    style={{ borderColor: 'var(--border-color)' }}
                                                >
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => setSelectedVerse(null)}
                                                className="w-full py-2 text-sm theme-text-secondary"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Chapter Content with Tabs */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200 rounded-2xl p-1">
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
                                        <div className="rounded-3xl p-6 theme-card">
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
                                                                        "text-slate-800 leading-relaxed font-serif transition-all",
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
                                    ) : commentaryData ? (
                                        <div className="bg-white rounded-3xl p-6 border border-slate-200">
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
                                    ) : (
                                        <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-slate-500">
                                            No commentary available for this chapter
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="references" className="mt-4">
                                    {datasetLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                        </div>
                                    ) : datasetData ? (
                                        <div className="bg-white rounded-3xl p-6 border border-slate-200">
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
                                        <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-slate-500">
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