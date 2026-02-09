// Native device integration utilities

/**
 * Trigger haptic feedback on supported devices
 */
export const haptic = (type = 'light') => {
    // iOS Haptic Feedback
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.hapticFeedback) {
        window.webkit.messageHandlers.hapticFeedback.postMessage({ type });
    }
    // Android Haptic Feedback
    else if (window.Android && window.Android.hapticFeedback) {
        window.Android.hapticFeedback(type);
    }
    // Web Vibration API fallback
    else if ('vibrate' in navigator) {
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [50, 100, 50]
        };
        navigator.vibrate(patterns[type] || patterns.light);
    }
};

/**
 * Native share functionality
 */
export const nativeShare = async (data) => {
    const { title, text, url } = data;
    
    // Native iOS Share Sheet
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.share) {
        window.webkit.messageHandlers.share.postMessage({ title, text, url });
        return true;
    }
    // Native Android Share
    else if (window.Android && window.Android.share) {
        window.Android.share(title, text, url || '');
        return true;
    }
    // Web Share API
    else if (navigator.share) {
        try {
            await navigator.share({ title, text, url });
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
            return false;
        }
    }
    
    // Fallback to clipboard
    try {
        await navigator.clipboard.writeText(text);
        return false; // Indicates fallback was used
    } catch (err) {
        console.error('Copy failed:', err);
        return false;
    }
};

/**
 * Cache Bible chapters for offline access
 */
export const chapterCache = {
    async set(key, data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(`bible_cache_${key}`, JSON.stringify(cacheData));
        } catch (err) {
            console.error('Cache set failed:', err);
        }
    },
    
    async get(key, maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
        try {
            const cached = localStorage.getItem(`bible_cache_${key}`);
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            
            // Check if cache is still valid
            if (Date.now() - timestamp > maxAge) {
                localStorage.removeItem(`bible_cache_${key}`);
                return null;
            }
            
            return data;
        } catch (err) {
            console.error('Cache get failed:', err);
            return null;
        }
    },
    
    async clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('bible_cache_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (err) {
            console.error('Cache clear failed:', err);
        }
    }
};