import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Home, BookOpen, Camera, Settings, Book } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const navItems = [
  { id: 'Home', icon: Home, label: 'Home' },
  { id: 'BibleReader', icon: Book, label: 'Bible' },
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
      '--bg-gradient-from': '#D4EAF7',
      '--bg-gradient-to': '#E0F2F1',
      '--accent-primary': '#A8DADC',
      '--accent-secondary': '#B2D8B2',
      '--accent-warm': '#FAD5A5',
      '--text-primary': '#1E3A5F',
      '--text-secondary': '#475569',
      '--text-light': '#64748B',
      '--card-bg': '#F0FFFE',
      '--card-overlay': '#E5F7F6',
      '--button-primary': '#5DADE2',
      '--button-secondary': '#B2D8B2',
      '--border-color': '#B8E6E3',
      '--nav-bg': 'rgba(240, 255, 254, 0.95)',
    },
    still_waters: {
      '--bg-primary': '#E0F7FA',
      '--bg-secondary': '#D9E8E6',
      '--bg-gradient-from': '#E0F7FA',
      '--bg-gradient-to': '#EDE7F6',
      '--accent-primary': '#E1BEE7',
      '--accent-secondary': '#D7BDE2',
      '--accent-warm': '#E8DAB2',
      '--text-primary': '#37474F',
      '--text-secondary': '#546E7A',
      '--text-light': '#78909C',
      '--card-bg': '#F3F0F8',
      '--card-overlay': '#EDE7F6',
      '--button-primary': '#9575CD',
      '--button-secondary': '#B39DDB',
      '--border-color': '#D9D1E3',
      '--nav-bg': 'rgba(243, 240, 248, 0.95)',
    },
    eternal_hope: {
      '--bg-primary': '#FFF8E8',
      '--bg-secondary': '#FDFBF7',
      '--bg-gradient-from': '#FFF8E8',
      '--bg-gradient-to': '#FFE8D6',
      '--accent-primary': '#E8C39E',
      '--accent-secondary': '#FADADD',
      '--accent-warm': '#F9E4B7',
      '--text-primary': '#3E2723',
      '--text-secondary': '#5D4037',
      '--text-light': '#795548',
      '--card-bg': '#FFF9F0',
      '--card-overlay': '#FFF4E6',
      '--button-primary': '#D4A574',
      '--button-secondary': '#E8B298',
      '--border-color': '#E8D4C4',
      '--nav-bg': 'rgba(255, 249, 240, 0.95)',
    },
  };

  const currentTheme = themeStyles[theme];

  // Hide nav on onboarding or capture/mood pages for full-screen experience
  const hideNav = !currentPageName || 
    currentPageName === 'CaptureMoment' || 
    currentPageName === 'HeartCheck';

  return (
    <div className="min-h-screen max-w-md mx-auto" style={{ 
      background: `linear-gradient(to bottom, ${currentTheme['--bg-gradient-from']}, ${currentTheme['--bg-gradient-to']})` 
    }}>
      <style>{`
        :root {
          ${Object.entries(currentTheme).map(([key, value]) => `${key}: ${value};`).join('\n          ')}
        }
        body {
          max-width: 448px;
          margin: 0 auto;
          background: linear-gradient(to bottom, ${currentTheme['--bg-gradient-from']}, ${currentTheme['--bg-gradient-to']});
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
          background: linear-gradient(to right, ${currentTheme['--button-primary']}, ${currentTheme['--button-secondary']}) !important;
          color: white !important;
        }
        .theme-accent {
          background-color: ${currentTheme['--accent-primary']} !important;
        }
      `}</style>
      
      {children}

      {/* Bottom Navigation */}
      {!hideNav && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 backdrop-blur-lg z-40 max-w-md mx-auto"
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
                    <Icon 
                      className="w-5 h-5 transition-colors"
                      style={{ color: isActive ? currentTheme['--text-primary'] : currentTheme['--text-light'] }}
                    />
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