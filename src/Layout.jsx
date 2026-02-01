import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Home, BookOpen, Camera, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
  { id: 'Home', icon: Home, label: 'Home' },
  { id: 'Journal', icon: BookOpen, label: 'Journal' },
  { id: 'CaptureMoment', icon: Camera, label: 'Capture', highlight: true },
  { id: 'Settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  // Hide nav on onboarding or capture/mood pages for full-screen experience
  const hideNav = !currentPageName || 
    currentPageName === 'CaptureMoment' || 
    currentPageName === 'HeartCheck';

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        :root {
          --color-primary: #5DADE2;
          --color-accent: #F4D03F;
        }
      `}</style>
      
      {children}

      {/* Bottom Navigation */}
      {!hideNav && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-2 pb-safe z-40"
        >
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.id;
              
              return (
                <Link
                  key={item.id}
                  to={createPageUrl(item.id)}
                  className={cn(
                    "flex flex-col items-center py-2 px-4 rounded-2xl transition-all",
                    item.highlight && "relative"
                  )}
                >
                  {item.highlight ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-14 h-14 -mt-6 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-200"
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                  ) : (
                    <>
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        isActive ? "bg-sky-100" : "bg-transparent"
                      )}>
                        <Icon className={cn(
                          "w-6 h-6 transition-colors",
                          isActive ? "text-sky-500" : "text-slate-400"
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs mt-1 font-medium transition-colors",
                        isActive ? "text-sky-500" : "text-slate-400"
                      )}>
                        {item.label}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </div>
  );
}