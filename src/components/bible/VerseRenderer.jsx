import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlighter, MessageSquare, X } from 'lucide-react';
import { cn } from "@/lib/utils";

const HIGHLIGHT_COLORS = [
    { id: 'yellow', name: 'Yellow', color: 'rgb(253, 224, 71)' },
    { id: 'green', name: 'Green', color: 'rgb(134, 239, 172)' },
    { id: 'blue', name: 'Blue', color: 'rgb(147, 197, 253)' },
    { id: 'pink', name: 'Pink', color: 'rgb(244, 114, 182)' },
];

export default function VerseRenderer({ 
    htmlContent, 
    highlights = {}, 
    comments = {},
    onHighlight,
    onComment 
}) {
    const [selectedVerse, setSelectedVerse] = useState(null);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState('');

    // Parse HTML into verses
    const verses = useMemo(() => {
        if (!htmlContent) return [];
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const verseLabels = doc.querySelectorAll('.yv-vlbl');
        
        const result = [];
        verseLabels.forEach((label, idx) => {
            const verseNum = label.textContent.trim();
            let text = '';
            
            // Get text until next verse label
            let node = label.nextSibling;
            while (node && (!node.classList || !node.classList.contains('yv-vlbl'))) {
                if (node.nodeType === Node.TEXT_NODE) {
                    text += node.textContent;
                } else if (node.textContent) {
                    text += node.textContent;
                }
                node = node.nextSibling;
            }
            
            result.push({
                number: verseNum,
                text: text.trim()
            });
        });
        
        return result;
    }, [htmlContent]);

    const handleVerseClick = (verseNum) => {
        setSelectedVerse(verseNum === selectedVerse ? null : verseNum);
        setShowCommentInput(false);
    };

    const handleHighlight = (verseNum, color) => {
        onHighlight?.(verseNum, color);
        setSelectedVerse(null);
    };

    const handleAddComment = (verseNum) => {
        setShowCommentInput(true);
        setCommentText(comments[verseNum] || '');
    };

    const handleSaveComment = () => {
        if (commentText.trim()) {
            onComment?.(selectedVerse, commentText);
        }
        setShowCommentInput(false);
        setSelectedVerse(null);
    };

    if (!verses.length) {
        return <p className="text-slate-800 leading-relaxed px-4 py-6">{htmlContent}</p>;
    }

    return (
        <div className="px-4 py-6">
            {verses.map((verse) => {
                const highlight = highlights[verse.number];
                const hasComment = comments[verse.number];
                
                return (
                    <div key={verse.number} className="relative mb-2">
                        <span
                            onClick={() => handleVerseClick(verse.number)}
                            className={cn(
                                "inline cursor-pointer leading-relaxed text-slate-800",
                                selectedVerse === verse.number && "underline"
                            )}
                            style={{
                                backgroundColor: highlight ? HIGHLIGHT_COLORS.find(c => c.id === highlight)?.color : 'transparent'
                            }}
                        >
                            <span className="text-sky-500 font-bold text-xs align-super mr-1.5">
                                {verse.number}
                            </span>
                            {verse.text}
                        </span>

                        {hasComment && (
                            <MessageSquare className="inline-block ml-1 w-3 h-3 text-sky-500" />
                        )}

                        {/* Action Menu */}
                        <AnimatePresence>
                            {selectedVerse === verse.number && !showCommentInput && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-2 p-3 rounded-lg shadow-lg border theme-card"
                                    style={{
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Highlighter className="w-4 h-4 theme-text-secondary" />
                                            <span className="text-sm font-medium theme-text-primary">Highlight:</span>
                                            <div className="flex gap-1">
                                                {HIGHLIGHT_COLORS.map(color => (
                                                    <div
                                                        key={color.id}
                                                        onClick={() => handleHighlight(verse.number, color.id)}
                                                        className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer"
                                                        style={{ 
                                                            backgroundColor: color.color,
                                                            borderColor: highlight === color.id ? 'var(--text-primary)' : 'var(--border-color)',
                                                            boxShadow: highlight === color.id ? '0 0 0 2px var(--border-color)' : 'none'
                                                        }}
                                                    />
                                                ))}
                                                {highlight && (
                                                    <button
                                                        onClick={() => handleHighlight(verse.number, null)}
                                                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center theme-card"
                                                        style={{
                                                            borderColor: 'var(--border-color)'
                                                        }}
                                                    >
                                                        <X className="w-3 h-3 theme-text-secondary" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddComment(verse.number)}
                                            className="flex items-center gap-2 text-sm theme-text-secondary hover:theme-text-primary"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            {hasComment ? 'Edit note' : 'Add note'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Comment Input */}
                            {selectedVerse === verse.number && showCommentInput && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-2 p-3 rounded-lg shadow-lg border theme-card"
                                    style={{
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add your note..."
                                        className="w-full p-2 border rounded text-sm theme-card theme-text-primary"
                                        style={{
                                            borderColor: 'var(--border-color)'
                                        }}
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={handleSaveComment}
                                            className="px-3 py-1 rounded text-sm theme-text-primary"
                                            style={{
                                                backgroundColor: 'var(--accent-primary)'
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowCommentInput(false);
                                                setSelectedVerse(null);
                                            }}
                                            className="px-3 py-1 rounded text-sm theme-card theme-text-secondary"
                                            style={{
                                                borderColor: 'var(--border-color)'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}