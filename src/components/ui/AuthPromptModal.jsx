import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AuthPromptModal({ isOpen, onClose }) {
  const handleSignUp = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-4 right-4 z-50 rounded-3xl p-6 max-w-sm mx-auto"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full theme-text-secondary opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-primary)' }}>
                <Sparkles className="w-7 h-7" style={{ color: 'var(--text-primary)' }} />
              </div>
            </div>

            {/* Text */}
            <h2 className="text-xl font-bold text-center theme-text-primary mb-2">
              Unlock Full Access
            </h2>
            <p className="text-sm text-center theme-text-secondary leading-relaxed mb-6">
              Create a free account to save your journal entries, notes, bookmarks, and unlock everything the app has to offer.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSignUp}
                className="w-full py-3 rounded-2xl font-semibold text-sm transition-all"
                style={{
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                }}
              >
                Yes, sign me up! ✨
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl font-medium text-sm theme-text-secondary transition-all"
                style={{ border: '1px solid var(--border-color)' }}
              >
                No thanks, just browsing
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}