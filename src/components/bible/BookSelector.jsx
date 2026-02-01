import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BookSelector({ books, onSelectBook, selectedBook }) {
    const oldTestament = books.filter(b => b.testament === 'OT');
    const newTestament = books.filter(b => b.testament === 'NT');

    const BookItem = ({ book }) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectBook(book)}
            className={cn(
                "flex items-center justify-between p-4 rounded-2xl transition-all",
                selectedBook?.id === book.id
                    ? "bg-gradient-to-r from-sky-100 to-sky-50 border-2 border-sky-300"
                    : "bg-white border border-slate-200 hover:border-sky-200"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-xl",
                    selectedBook?.id === book.id ? "bg-sky-200" : "bg-slate-100"
                )}>
                    <BookOpen className={cn(
                        "w-4 h-4",
                        selectedBook?.id === book.id ? "text-sky-600" : "text-slate-500"
                    )} />
                </div>
                <div className="text-left">
                    <p className="font-semibold text-slate-800">{book.name}</p>
                    <p className="text-xs text-slate-500">{book.numberOfChapters} chapters</p>
                </div>
            </div>
            <ChevronRight className={cn(
                "w-5 h-5",
                selectedBook?.id === book.id ? "text-sky-500" : "text-slate-400"
            )} />
        </motion.button>
    );

    return (
        <div className="space-y-6">
            {oldTestament.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
                        Old Testament
                    </h3>
                    <div className="space-y-2">
                        {oldTestament.map((book) => (
                            <BookItem key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            )}

            {newTestament.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
                        New Testament
                    </h3>
                    <div className="space-y-2">
                        {newTestament.map((book) => (
                            <BookItem key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}