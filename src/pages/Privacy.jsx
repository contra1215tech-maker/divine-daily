import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Database, Camera, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function Privacy() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const privacyItems = [
    {
      icon: Camera,
      title: 'Your Photos',
      description: 'All photos you capture are stored securely in your personal account. Only you can access your photos. We never share, sell, or use your photos for any purpose other than displaying them to you in the app.'
    },
    {
      icon: BookOpen,
      title: 'Journal Entries',
      description: 'Your journal entries, reflections, and notes are completely private. They are encrypted and stored in your personal database. No one else can read your journal entries, not even app administrators.'
    },
    {
      icon: Database,
      title: 'Data Storage',
      description: 'All your data is stored securely on protected servers. Your information is backed up regularly to prevent data loss, but remains completely private to your account.'
    },
    {
      icon: Lock,
      title: 'Bible Reading History',
      description: 'Your Bible reading history, favorite verses, and comments are private to your account. We use this data only to provide you with a personalized experience within the app.'
    },
    {
      icon: Shield,
      title: 'Account Security',
      description: 'Your account is protected with industry-standard security measures. We never store your password in plain text, and all data transmission is encrypted.'
    },
    {
      icon: Eye,
      title: 'No Third-Party Sharing',
      description: 'We do not share, sell, or distribute your personal information, photos, or journal entries to any third parties. Your privacy is our top priority.'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-lg z-10 px-6 py-4" style={{
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border-2 theme-text-primary flex items-center justify-center"
            style={{ borderColor: 'var(--text-light)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold theme-text-primary">Privacy Policy</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 rounded-3xl theme-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl theme-accent flex items-center justify-center">
              <Shield className="w-6 h-6 theme-text-primary" />
            </div>
            <h2 className="text-lg font-bold theme-text-primary">Your Privacy Matters</h2>
          </div>
          <p className="text-sm theme-text-secondary leading-relaxed">
            Divine Daily is designed with your privacy as a core principle. Your spiritual journey, 
            journal entries, and photos are personal and sacred. Here's how we protect your privacy:
          </p>
        </motion.div>

        {/* Privacy Items */}
        <div className="space-y-3">
          {privacyItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-2xl theme-card"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 theme-text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold theme-text-primary mb-2">{item.title}</h3>
                    <p className="text-sm theme-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-5 rounded-2xl theme-card"
        >
          <h3 className="font-semibold theme-text-primary mb-3">Data Deletion</h3>
          <p className="text-sm theme-text-secondary leading-relaxed mb-3">
            You have the right to delete your account and all associated data at any time. 
            If you wish to delete your account, please contact support and we will permanently 
            remove all your data from our servers within 30 days.
          </p>
          <h3 className="font-semibold theme-text-primary mb-3">Questions?</h3>
          <p className="text-sm theme-text-secondary leading-relaxed">
            If you have any questions about our privacy practices or how we handle your data, 
            please don't hesitate to reach out to us through the Settings page.
          </p>
        </motion.div>

        {/* Last Updated */}
        <p className="text-xs text-center theme-text-secondary mt-6 mb-4">
          Last updated: February 3, 2026
        </p>
      </div>
    </div>
  );
}