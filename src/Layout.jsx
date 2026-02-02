import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { BookOpen, Camera, Settings, Book } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const navItems = [
  { id: 'BibleReader', icon: Book, label: 'Bible', useImage: true },
  { id: 'Journal', icon: BookOpen, label: 'Journal' },
  { id: 'CaptureMoment', icon: Camera, label: 'Capture' },
  { id: 'Settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const theme = user?.theme || 'morning_dew';

  const themeStyles = {
    morning_dew: {
      '--bg-primary': '#E0F2F1',
      '--bg-secondary': '#D4EAF7',
      '--bg-gradient-from': '#C8E6F5',
      '--bg-gradient-to': '#E8D5F2',
      '--accent-primary': '#A8DADC',
      '--accent-secondary': '#B2D8B2',
      '--accent-warm': '#FAD5A5',
      '--text-primary': '#1E3A5F',
      '--text-secondary': '#475569',
      '--text-light': '#64748B',
      '--card-bg': 'rgba(240, 255, 254, 0.4)',
      '--card-overlay': 'rgba(229, 247, 246, 0.4)',
      '--button-primary': 'transparent',
      '--button-secondary': 'transparent',
      '--border-color': 'rgba(184, 230, 227, 0.3)',
      '--nav-bg': 'rgba(240, 255, 254, 0.7)',
    },
    still_waters: {
      '--bg-primary': '#E0F7FA',
      '--bg-secondary': '#D9E8E6',
      '--bg-gradient-from': '#7FA8D1',
      '--bg-gradient-to': '#C8A8E6',
      '--accent-primary': '#E1BEE7',
      '--accent-secondary': '#D7BDE2',
      '--accent-warm': '#E8DAB2',
      '--text-primary': '#37474F',
      '--text-secondary': '#546E7A',
      '--text-light': '#78909C',
      '--card-bg': 'rgba(243, 240, 248, 0.4)',
      '--card-overlay': 'rgba(237, 231, 246, 0.4)',
      '--button-primary': 'transparent',
      '--button-secondary': 'transparent',
      '--border-color': 'rgba(217, 209, 227, 0.3)',
      '--nav-bg': 'rgba(243, 240, 248, 0.7)',
    },
    eternal_hope: {
      '--bg-primary': '#FFF8E8',
      '--bg-secondary': '#FDFBF7',
      '--bg-gradient-from': '#F5C5A8',
      '--bg-gradient-to': '#FADADD',
      '--accent-primary': '#E8C39E',
      '--accent-secondary': '#FADADD',
      '--accent-warm': '#F9E4B7',
      '--text-primary': '#3E2723',
      '--text-secondary': '#5D4037',
      '--text-light': '#795548',
      '--card-bg': 'rgba(255, 249, 240, 0.4)',
      '--card-overlay': 'rgba(255, 244, 230, 0.4)',
      '--button-primary': 'transparent',
      '--button-secondary': 'transparent',
      '--border-color': 'rgba(232, 212, 196, 0.3)',
      '--nav-bg': 'rgba(255, 249, 240, 0.7)',
    },
    dark_mode: {
      '--bg-primary': '#1A0B2E',
      '--bg-secondary': '#2D1B4E',
      '--bg-gradient-from': '#2D1B4E',
      '--bg-gradient-to': '#6B4BA6',
      '--accent-primary': '#8B5FBF',
      '--accent-secondary': '#A78BCA',
      '--accent-warm': '#9D7CC9',
      '--text-primary': '#E8E3F0',
      '--text-secondary': '#B8AED1',
      '--text-light': '#9B8FB8',
      '--card-bg': 'rgba(45, 27, 78, 0.4)',
      '--card-overlay': 'rgba(45, 27, 78, 0.4)',
      '--button-primary': 'transparent',
      '--button-secondary': 'transparent',
      '--border-color': 'rgba(139, 95, 191, 0.3)',
      '--nav-bg': 'rgba(45, 27, 78, 0.7)',
      '--bible-text': '#F5F1E8',
    },
  };

  const currentTheme = themeStyles[theme];

  // Hide nav on onboarding or mood pages for full-screen experience
  const hideNav = !currentPageName || 
    currentPageName === 'HeartCheck';

  return (
    <div className="min-h-screen max-w-md mx-auto" style={{ 
      background: `linear-gradient(to bottom, ${currentTheme['--bg-gradient-from']}, ${currentTheme['--bg-gradient-to']})` 
    }}>
      <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

            :root {
              ${Object.entries(currentTheme).map(([key, value]) => `${key}: ${value};`).join('\n          ')}
            }
            * {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            body {
              max-width: 448px;
              margin: 0 auto;
              background: linear-gradient(to bottom, ${currentTheme['--bg-gradient-from']}, ${currentTheme['--bg-gradient-to']});
              overflow-x: hidden;
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* IE and Edge */
            }
            body::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
            
        .theme-card {
          background-color: ${currentTheme['--card-bg']} !important;
          border-color: ${currentTheme['--border-color']} !important;
        }
        .theme-text-primary {
          color: ${currentTheme['--text-primary']} !important;
        }
        .theme-text-secondary {
          color: ${currentTheme['--text-secondary']} !important;
        }
        .theme-button {
          background: transparent !important;
          color: ${currentTheme['--text-primary']} !important;
        }
        .theme-accent {
          background-color: ${currentTheme['--accent-primary']} !important;
        }
      button, .theme-button, [role="button"] {
        background: transparent !important;
        background-image: none !important;
        border-color: ${currentTheme['--text-light']} !important;
      }
      button:hover, .theme-button:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }
      ${theme === 'dark_mode' ? `
        p, span, .dark-mode-text {
          color: #F5F1E8 !important;
        }
      ` : ''}
      `}</style>

      <div className="pb-24">
        {children}
      </div>

      {/* Bottom Navigation */}
      {!hideNav && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto backdrop-blur-xl"
          style={{ 
            backgroundColor: currentTheme['--nav-bg'],
            borderTop: `1px solid ${currentTheme['--border-color']}`
          }}
        >
          <div className="flex items-center justify-around py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.id;

              return (
                <Link
                  key={item.id}
                  to={createPageUrl(item.id)}
                  className="flex flex-col items-center py-2 px-2 rounded-xl transition-all"
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive && "theme-accent"
                  )}>
                    {item.useImage ? (
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/29b034366_cross.jpg"
                        alt={item.label}
                        className="w-5 h-5 object-cover rounded"
                      />
                    ) : (
                      <Icon 
                        className="w-5 h-5 transition-colors"
                        style={{ color: isActive ? currentTheme['--text-primary'] : currentTheme['--text-light'] }}
                      />
                    )}
                  </div>
                  <span 
                    className="text-[10px] mt-0.5 font-medium transition-colors"
                    style={{ color: isActive ? currentTheme['--text-primary'] : currentTheme['--text-light'] }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </div>
  );
}