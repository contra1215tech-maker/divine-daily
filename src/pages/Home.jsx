import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to BibleReader as the main page
        navigate(createPageUrl('BibleReader'), { replace: true });
    }, [navigate]);

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