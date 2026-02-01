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
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBookClick(book)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-sky-500" />
                        <div className="text-left">
                            <p className="font-semibold text-slate-800 text-sm">{book.name}</p>
                            <p className="text-xs text-slate-500">{book.numberOfChapters} ch</p>
                        </div>
                    </div>
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                </motion.button>
                
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-slate-200"
                        >
                            <div className="p-2 bg-slate-50">
                                <div className="grid grid-cols-6 gap-1">
                                    {chapters.map((chapter) => (
                                        <motion.button
                                            key={chapter}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleChapterClick(book, chapter)}
                                            className="aspect-square rounded-lg bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors"
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
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
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
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
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