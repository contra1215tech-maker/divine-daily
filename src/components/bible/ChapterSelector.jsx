import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function ChapterSelector({ numberOfChapters, selectedChapter, onSelectChapter }) {
    const chapters = Array.from({ length: numberOfChapters }, (_, i) => i + 1);

    return (
        <div className="grid grid-cols-6 gap-2">
            {chapters.map((chapter) => (
                <motion.button
                    key={chapter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectChapter(chapter)}
                    className={cn(
                        "aspect-square rounded-xl font-semibold transition-all",
                        selectedChapter === chapter
                            ? "bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-200"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-sky-300"
                    )}
                >
                    {chapter}
                </motion.button>
            ))}
        </div>
    );
}