import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, Settings2, Loader2, MessageSquare, Database } from 'lucide-react';
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
        setSelectedChapter(1);
        setShowBookSelector(false);
    };

    const handleChapterSelect = (chapter) => {
        setSelectedChapter(chapter);
        setActiveTab('text'); // Reset to text tab when changing chapters
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
                                        <div className="bg-white rounded-3xl p-6 border border-slate-200">
                                            <div className="space-y-4">
                                                {chapterData.chapter.content
                                                    .filter(item => item.type === 'verse')
                                                    .map((verse) => (
                                                        <div key={verse.number} className="flex gap-3">
                                                            <span className="text-sm font-bold text-sky-500 mt-1 flex-shrink-0">
                                                                {verse.number}
                                                            </span>
                                                            <p className="text-slate-800 leading-relaxed font-serif">
                                                                {Array.isArray(verse.content) 
                                                                    ? verse.content.map(item => 
                                                                        typeof item === 'string' ? item : item.text || ''
                                                                    ).join(' ')
                                                                    : verse.content}
                                                            </p>
                                                        </div>
                                                    ))}
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