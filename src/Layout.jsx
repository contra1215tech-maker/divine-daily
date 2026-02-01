import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Home, BookOpen, Camera, Settings, Book } from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
  { id: 'Home', icon: Home, label: 'Home' },
  { id: 'BibleReader', icon: Book, label: 'Bible' },
  { id: 'Journal', icon: BookOpen, label: 'Journal' },
  { id: 'CaptureMoment', icon: Camera, label: 'Capture' },
  { id: 'Settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  // Hide nav on onboarding or capture/mood pages for full-screen experience
  const hideNav = !currentPageName || 
    currentPageName === 'CaptureMoment' || 
    currentPageName === 'HeartCheck';

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto">
      <style>{`
        :root {
          --color-primary: #5DADE2;
          --color-accent: #F4D03F;
        }
        body {
          max-width: 448px;
          margin: 0 auto;
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