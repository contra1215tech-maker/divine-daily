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
      '--accent-primary': '#A8DADC',
      '--accent-secondary': '#B2D8B2',
      '--accent-warm': '#FAD5A5',
      '--text-primary': '#1E3A5F',
      '--text-secondary': '#475569',
      '--card-bg': '#FFFFFF',
      '--card-overlay': '#FEFEFE',
    },
    still_waters: {
      '--bg-primary': '#E0F7FA',
      '--bg-secondary': '#D9E8E6',
      '--accent-primary': '#E1BEE7',
      '--accent-secondary': '#D7BDE2',
      '--accent-warm': '#E8DAB2',
      '--text-primary': '#4A5568',
      '--text-secondary': '#64748B',
      '--card-bg': '#FFFFFF',
      '--card-overlay': '#F5F0E6',
    },
    eternal_hope: {
      '--bg-primary': '#FDFBF7',
      '--bg-secondary': '#FFF8E8',
      '--accent-primary': '#FADADD',
      '--accent-secondary': '#E8C39E',
      '--accent-warm': '#F9E4B7',
      '--text-primary': '#3E2723',
      '--text-secondary': '#5D4037',
      '--card-bg': '#FFFFFF',
      '--card-overlay': '#FFFAF0',
    },
  };

  const currentTheme = themeStyles[theme];

  // Hide nav on onboarding or capture/mood pages for full-screen experience
  const hideNav = !currentPageName || 
    currentPageName === 'CaptureMoment' || 
    currentPageName === 'HeartCheck';

  return (
    <div className="min-h-screen max-w-md mx-auto" style={{ backgroundColor: currentTheme['--bg-primary'] }}>
      <style>{`
        :root {
          ${Object.entries(currentTheme).map(([key, value]) => `${key}: ${value};`).join('\n          ')}
        }
        body {
          max-width: 448px;
          margin: 0 auto;
          background-color: ${currentTheme['--bg-primary']};
        }
      `}</style>
      
      {children}

      {/* Bottom Navigation */}
      {!hideNav && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 z-40 max-w-md mx-auto"
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
                    isActive ? "bg-sky-100" : "bg-transparent"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-sky-500" : "text-slate-400"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] mt-0.5 font-medium transition-colors",
                    isActive ? "text-sky-500" : "text-slate-400"
                  )}>
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