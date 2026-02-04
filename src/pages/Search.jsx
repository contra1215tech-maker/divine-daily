import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const UPLIFTING_VERSES = [
    { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me.", book_id: "PHP", chapter: 4, verse: 13 },
    { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", book_id: "JER", chapter: 29, verse: 11 },
    { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want.", book_id: "PSA", chapter: 23, verse: 1 },
    { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", book_id: "ROM", chapter: 8, verse: 28 },
    { ref: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.", book_id: "ISA", chapter: 41, verse: 10 },
    { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", book_id: "PRO", chapter: 3, verse: 5 },
    { ref: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest.", book_id: "MAT", chapter: 11, verse: 28 },
    { ref: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", book_id: "JOS", chapter: 1, verse: 9 }
];

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const navigate = useNavigate();

    // Get verse of the day based on current date
    const getVerseOfTheDay = () => {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const index = dayOfYear % UPLIFTING_VERSES.length;
        return UPLIFTING_VERSES[index];
    };

    const verseOfTheDay = getVerseOfTheDay();

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Search verses
    const { data: searchResults, isLoading: searching } = useQuery({
        queryKey: ['bible-search', debouncedQuery],
        queryFn: async () => {
            const response = await base44.functions.invoke('searchBibleVerses', {
                query: debouncedQuery
            });
            return response.data;
        },
        enabled: debouncedQuery.length >= 2,
    });

    const handleVerseClick = (result) => {
        navigate(createPageUrl('BibleReader'));
        // Note: This will navigate to the Bible reader. In a full implementation,
        // you'd want to pass the book/chapter as URL params or state
    };

    return (
        <div className="min-h-screen" style={{ background: 'transparent' }}>
            {/* Header */}
            <div className="backdrop-blur-md sticky top-0 z-10" style={{
                background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-gradient-from))',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <div className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <SearchIcon className="w-5 h-5 theme-text-primary" />
                        <h1 className="text-xl font-bold theme-text-primary">Search</h1>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 space-y-6">
                {/* Verse of the Day */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl p-6 theme-card"
                    style={{ boxShadow: 'var(--shadow-lg)' }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-bold theme-text-primary">Verse of the Day</h2>
                    </div>
                    <p className="text-sm theme-text-secondary mb-2 font-semibold">
                        {verseOfTheDay.ref}
                    </p>
                    <p className="theme-text-primary leading-relaxed">
                        {verseOfTheDay.text}
                    </p>
                </motion.div>

                {/* Search Input */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold theme-text-secondary">Search Scripture</h3>
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 theme-text-secondary" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by keyword or phrase..."
                            className="pl-12 pr-4 py-6 rounded-3xl border theme-text-primary"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                    </div>
                    {searchQuery.length > 0 && searchQuery.length < 2 && (
                        <p className="text-xs theme-text-secondary">
                            Type at least 2 characters to search
                        </p>
                    )}
                </div>

                {/* Search Results */}
                <AnimatePresence mode="wait">
                    {searching && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center py-12"
                        >
                            <Loader2 className="w-8 h-8 theme-text-secondary animate-spin" />
                        </motion.div>
                    )}

                    {!searching && debouncedQuery.length >= 2 && searchResults?.results && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            <h3 className="text-sm font-semibold theme-text-secondary">
                                {searchResults.results.length} {searchResults.results.length === 1 ? 'verse' : 'verses'} found
                            </h3>

                            {searchResults.results.length === 0 ? (
                                <div className="rounded-3xl p-8 theme-card text-center">
                                    <BookOpen className="w-12 h-12 theme-text-secondary mx-auto mb-3 opacity-50" />
                                    <p className="theme-text-secondary">
                                        No verses found for "{debouncedQuery}"
                                    </p>
                                    <p className="text-xs theme-text-secondary mt-2">
                                        Try different keywords or phrases
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {searchResults.results.map((result, idx) => (
                                        <motion.div
                                            key={`${result.reference}-${idx}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => handleVerseClick(result)}
                                            className="rounded-3xl p-4 theme-card cursor-pointer transition-all hover:scale-[1.02]"
                                            style={{ boxShadow: 'var(--shadow)' }}
                                        >
                                            <p className="text-sm font-bold theme-text-primary mb-2">
                                                {result.reference}
                                            </p>
                                            <p className="theme-text-secondary text-sm leading-relaxed">
                                                {result.text}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}