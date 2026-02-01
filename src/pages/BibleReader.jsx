import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, Settings2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BookSelector from '../components/bible/BookSelector';
import ChapterSelector from '../components/bible/ChapterSelector';

export default function BibleReader() {
    const [user, setUser] = useState(null);
    const [translationId, setTranslationId] = useState('BSB');
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [showBookSelector, setShowBookSelector] = useState(true);

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
        enabled: !!selectedBook && !!selectedChapter,
    });

    const handleBookSelect = (book) => {
        setSelectedBook(book);
        setSelectedChapter(1);
        setShowBookSelector(false);
    };

    const handleChapterSelect = (chapter) => {
        setSelectedChapter(chapter);
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
                                <BookOpen className="w-5 h-5 text-sky-600" />
                                <h1 className="text-xl font-bold text-slate-800">Bible</h1>
                            </div>
                        )}

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings2 className="w-5 h-5 text-slate-600" />
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
                            <h2 className="text-lg font-semibold text-slate-800">
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
                                selectedBook={selectedBook}
                                onSelectBook={handleBookSelect}
                            />
                        </motion.div>
                    ) : selectedBook ? (
                        <motion.div
                            key="chapter-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Chapter Selector */}
                            <div className="bg-white rounded-3xl p-4 border border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-600 mb-3">
                                    Select Chapter
                                </h3>
                                <ChapterSelector
                                    numberOfChapters={selectedBook.numberOfChapters}
                                    selectedChapter={selectedChapter}
                                    onSelectChapter={handleChapterSelect}
                                />
                            </div>

                            {/* Chapter Content */}
                            {chapterLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                </div>
                            ) : chapterData ? (
                                <div className="bg-white rounded-3xl p-6 border border-slate-200">
                                    <div className="space-y-4">
                                        {chapterData.verses?.map((verse) => (
                                            <div key={verse.verse} className="flex gap-3">
                                                <span className="text-sm font-bold text-sky-500 mt-1 flex-shrink-0">
                                                    {verse.verse}
                                                </span>
                                                <p className="text-slate-800 leading-relaxed font-serif">
                                                    {verse.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}