import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { BookOpen, Camera, Settings, Book, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const getBibleImageUrl = (theme) => {
  if (theme === 'still_waters') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/d797acdae_bible.jpg';
  }
  if (theme === 'morning_dew') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/9db0b6a60_Screenshot2026-02-02at93125PM.png';
  }
  if (theme === 'eternal_hope') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/eb2f5728e_Screenshot2026-02-02at94127PM.png';
  }
  return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/29b034366_cross.jpg';
};

const getCaptureImageUrl = (theme) => {
  if (theme === 'still_waters') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/972571cf8_land.jpg';
  }
  if (theme === 'morning_dew') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/a863b2e59_Screenshot2026-02-02at93131PM.png';
  }
  if (theme === 'eternal_hope') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/eb94b036e_Screenshot2026-02-02at94150PM.png';
  }
  return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/b2b1b2e07_capture.jpg';
};

const getJournalImageUrl = (theme) => {
  if (theme === 'still_waters') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/142b3a4d7_journal.jpg';
  }
  if (theme === 'morning_dew') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/d11c8bb51_Screenshot2026-02-02at93119PM.png';
  }
  if (theme === 'eternal_hope') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/9822eaa28_Screenshot2026-02-02at94202PM.png';
  }
  return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/78da09cbb_newbible.jpg';
};

const getSettingsImageUrl = (theme) => {
  if (theme === 'still_waters') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/e719bac4e_settingsstillwaters.jpg';
  }
  if (theme === 'morning_dew') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/6fed27477_Screenshot2026-02-02at93112PM.png';
  }
  if (theme === 'eternal_hope') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/d801e7c55_Screenshot2026-02-02at94156PM.png';
  }
  return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/f67c4ee3a_settings.jpg';
};

const getSearchImageUrl = (theme) => {
  if (theme === 'morning_dew') {
    return 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/971026b6d_Screenshot2026-02-04at95411AM.png';
  }
  return null;
};

const getNavItems = (theme) => [
  { id: 'BibleReader', icon: Book, label: 'Bible', useImage: true, imageUrl: getBibleImageUrl(theme) },
  { id: 'Search', icon: BookOpen, label: 'Search', useImage: theme === 'morning_dew', imageUrl: getSearchImageUrl(theme) },
  { id: 'Journal', icon: BookOpen, label: 'Journal', useImage: true, imageUrl: getJournalImageUrl(theme) },
  { id: 'CaptureMoment', icon: Camera, label: 'Capture', useImage: true, imageUrl: getCaptureImageUrl(theme) },
  { id: 'Settings', icon: Settings, label: 'Settings', useImage: true, imageUrl: getSettingsImageUrl(theme) },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const theme = user?.theme || 'morning_dew';
  const navItems = getNavItems(theme);

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
      '--card-bg': 'rgba(240, 255, 254, 0.3)',
      '--card-overlay': 'rgba(229, 247, 246, 0.3)',
      '--button-primary': 'transparent',
      '--button-secondary': 'transparent',
      '--border-color': 'rgba(184, 230, 227, 0.15)',
      '--nav-bg': 'rgba(240, 255, 254, 0.5)',
      '--shadow': '0 8px 32px rgba(0, 0, 0, 0.06)',
      '--shadow-lg': '0 20px 60px rgba(0, 0, 0, 0.08)',
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
      '--card-bg': 'rgba(243, 240, 248, 0.3)',
      '--card-overlay': 'rgba(237, 231, 246, 0.3)',
      '--button-primary': 'transparent',
      '--button-secondary': 'transparent',
      '--border-color': 'rgba(217, 209, 227, 0.15)',
      '--nav-bg': 'rgba(243, 240, 248, 0.5)',
      '--shadow': '0 8px 32px rgba(0, 0, 0, 0.06)',
      '--shadow-lg': '0 20px 60px rgba(0, 0, 0, 0.08)',
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
      '--card-bg': 'rgba(255, 249, 240, 0.3)',
      '--card-overlay': 'rgba(255, 244, 230, 0.3)',
      '--button-primary': 'transparent',
      '--button-secondary': 'transparent',
      '--border-color': 'rgba(232, 212, 196, 0.15)',
      '--nav-bg': 'rgba(255, 249, 240, 0.5)',
      '--shadow': '0 8px 32px rgba(0, 0, 0, 0.06)',
      '--shadow-lg': '0 20px 60px rgba(0, 0, 0, 0.08)',
    },
    dark_mode: {
      '--bg-primary': '#2A1F14',
      '--bg-secondary': '#3A2A1A',
      '--bg-gradient-from': '#2A1F14',
      '--bg-gradient-to': '#3A2A1A',
      '--accent-primary': '#5A4A3A',
      '--accent-secondary': '#6A5A4A',
      '--accent-warm': '#7A6A5A',
      '--text-primary': '#E8E3F0',
      '--text-secondary': '#C8B8A8',
      '--text-light': '#A89888',
      '--card-bg': 'rgba(58, 42, 26, 0.3)',
      '--card-overlay': 'rgba(58, 42, 26, 0.3)',
      '--button-primary': 'transparent',
      '--button-secondary': 'transparent',
      '--border-color': 'rgba(90, 74, 58, 0.15)',
      '--nav-bg': 'rgba(58, 42, 26, 0.5)',
      '--bible-text': '#F5F1E8',
      '--shadow': '0 8px 32px rgba(0, 0, 0, 0.2)',
      '--shadow-lg': '0 20px 60px rgba(0, 0, 0, 0.3)',
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
            * {
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* IE and Edge */
            }
            *::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
            
        .theme-card {
          background-color: ${currentTheme['--card-bg']} !important;
          border-color: ${currentTheme['--border-color']} !important;
          border-radius: 24px !important;
          box-shadow: ${currentTheme['--shadow']} !important;
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
        border-radius: 16px !important;
        transition: all 0.3s ease !important;
      }
      button:hover, .theme-button:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        transform: translateY(-1px);
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
          className="fixed bottom-2 left-3 right-3 z-40 max-w-md mx-auto backdrop-blur-xl rounded-3xl border"
          style={{ 
            backgroundColor: currentTheme['--nav-bg'],
            borderColor: currentTheme['--border-color'],
            boxShadow: currentTheme['--shadow-lg']
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
                  className="flex flex-col items-center py-1 px-1 rounded-xl transition-all"
                >
                  <div className={cn(
                    "p-1 rounded-lg transition-colors",
                    isActive && "theme-accent"
                  )}>
                    {item.useImage ? (
                      <img 
                        src={item.imageUrl}
                        alt={item.label}
                        className="w-9 h-9 object-cover rounded"
                      />
                    ) : (
                      <Icon 
                        className="w-9 h-9 transition-colors"
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