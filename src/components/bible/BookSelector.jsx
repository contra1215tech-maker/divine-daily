import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BookSelector({ books, onSelectBook, onChapterSelect }) {
    const [expandedBook, setExpandedBook] = useState(null);
    
    // Split books by order: first 39 are OT, rest are NT
    const oldTestament = books.filter((b, idx) => idx < 39);
    const newTestament = books.filter((b, idx) => idx >= 39);

    const handleBookClick = (book) => {
        if (expandedBook?.id === book.id) {
            setExpandedBook(null);
        } else {
            setExpandedBook(book);
        }
    };

    const handleChapterClick = (book, chapter) => {
        onSelectBook(book);
        onChapterSelect(chapter);
    };

    const BookItem = ({ book }) => {
        const isExpanded = expandedBook?.id === book.id;
        const chapters = Array.from({ length: book.numberOfChapters }, (_, i) => i + 1);
        
        return (
            <div className="rounded-xl theme-card overflow-hidden">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBookClick(book)}
                    className="w-full flex items-center justify-between p-3 transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                >
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 theme-text-primary" />
                        <div className="text-left">
                            <p className="font-semibold text-sm theme-text-primary">{book.name}</p>
                            <p className="text-xs theme-text-secondary">{book.numberOfChapters} ch</p>
                        </div>
                    </div>
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 theme-text-secondary" />
                    ) : (
                        <ChevronRight className="w-4 h-4 theme-text-secondary" />
                    )}
                </motion.button>
                
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                            style={{ borderTop: '1px solid var(--border-color)' }}
                        >
                            <div className="p-2" style={{ backgroundColor: 'var(--card-overlay)' }}>
                                <div className="grid grid-cols-6 gap-1">
                                    {chapters.map((chapter) => (
                                        <motion.button
                                            key={chapter}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleChapterClick(book, chapter)}
                                            className="aspect-square rounded-lg theme-card text-sm font-medium theme-text-primary transition-colors hover:shadow-md"
                                        >
                                            {chapter}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {oldTestament.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 px-1 theme-text-secondary">
                        Old Testament
                    </h3>
                    <div className="space-y-1">
                        {oldTestament.map((book) => (
                            <BookItem key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            )}

            {newTestament.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 px-1 theme-text-secondary">
                        New Testament
                    </h3>
                    <div className="space-y-1">
                        {newTestament.map((book) => (
                            <BookItem key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}