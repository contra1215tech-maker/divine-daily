import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Database, Camera, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

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

export default function Privacy() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const privacyItems = [
    {
      icon: Camera,
      title: 'Camera Access',
      description: 'The app requests camera permission to let you capture photos for your journal entries. This is the only sensitive device feature we access. You can deny or revoke camera permission in your device settings at any time and still use text-only journaling and Bible reading features.'
    },
    {
      icon: BookOpen,
      title: 'Journal Entries & Photos',
      description: 'Your journal entries, reflections, and photos are transmitted to and stored on Base44\'s secure servers (our backend service provider) to enable backup and sync across devices. Data is encrypted during transmission (HTTPS). While we implement strict access controls and do not actively monitor or view your content, limited administrative access may exist for technical support or debugging purposes. Your data is linked to your account (via email) and used solely for app functionality.'
    },
    {
      icon: Database,
      title: 'Bible Content & Reading History',
      description: 'Bible texts are fetched in real-time from a third-party public Bible API (Bolls Life). These fetches are anonymous and we do not log or store your reading history on our servers. Your saved favorites, bookmarks, and personal comments are stored privately in your Base44 account for your personalized experience.'
    },
    {
      icon: Lock,
      title: 'Minimal Data Collection',
      description: 'We collect only what\'s essential: your email (for account access), and your chosen content (journal entries, photos, Bible bookmarks). We do NOT collect analytics, tracking data, device identifiers, location, contacts, microphone access, health data, or any other sensitive information beyond camera access for photos.'
    },
    {
      icon: Shield,
      title: 'Donation Processing',
      description: 'If you make an optional monthly donation to support the app, the App Store (Apple/Google) processes the payment and collects necessary payment details. We receive only limited confirmation data (donation amount and date). Your name and email for donation receipts come from your existing app account, not the payment processor. We do not store payment card details.'
    },
    {
      icon: Eye,
      title: 'No Third-Party Sharing',
      description: 'We do not sell, rent, share, or distribute your personal information, photos, or journal entries to any third parties for marketing or advertising. Data is shared only with: (1) the Bible API provider for fetching scripture text, (2) the App Store for processing donations, and (3) when required by law.'
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
            Divine Daily is a free Bible reading and personal journaling app designed with your privacy as a core principle. 
            We collect as little personal information as possible - only what's essential for the app to function. 
            Your spiritual journey, journal entries, and photos are personal and sacred. Here's how we protect your privacy:
          </p>
        </motion.div>

        {/* Privacy Items */}
        <div className="space-y-3">
          {privacyItems.map((item, index) => {
            const Icon = item.icon;
            const isJournalItem = index === 1; // Journal Entries item
            const theme = user?.theme || 'morning_dew';
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-2xl theme-card"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    {isJournalItem ? (
                      <img 
                        src={getJournalImageUrl(theme)}
                        alt="Journal"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full theme-accent flex items-center justify-center rounded-xl">
                        <Icon className="w-5 h-5 theme-text-primary" />
                      </div>
                    )}
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
          <h3 className="font-semibold theme-text-primary mb-3">Your Rights & Data Deletion</h3>
          <p className="text-sm theme-text-secondary leading-relaxed mb-3">
            You have full control over your data. You can delete individual journal entries and photos anytime within the app. 
            To delete your entire account and all associated data, please contact us and we will permanently remove 
            everything from our servers within 30 days. Under laws like GDPR and CCPA, you may have additional rights 
            to access, restrict, or port your data - contact us to exercise these rights.
          </p>
          <h3 className="font-semibold theme-text-primary mb-3">Security</h3>
          <p className="text-sm theme-text-secondary leading-relaxed mb-3">
            We use industry-standard security measures to protect your data, including encryption during transmission 
            and storage. Your account is password-protected (we never store passwords in plain text). While no method 
            of transmission over the internet is 100% secure, we continuously work to protect your information.
          </p>
          <h3 className="font-semibold theme-text-primary mb-3">Children's Privacy</h3>
          <p className="text-sm theme-text-secondary leading-relaxed mb-3">
            The app is not directed to children under 13 (or 16 in some regions). We do not knowingly collect 
            data from children. If we learn of such data, we will delete it immediately.
          </p>
          <h3 className="font-semibold theme-text-primary mb-3">Questions?</h3>
          <p className="text-sm theme-text-secondary leading-relaxed">
            If you have any questions about our privacy practices or how we handle your data, 
            please contact us at{' '}
            <a 
              href="mailto:divinedailytech@gmail.com" 
              className="font-medium underline"
              style={{ color: 'var(--text-primary)' }}
            >
              divinedailytech@gmail.com
            </a>
          </p>
        </motion.div>

        {/* Last Updated */}
        <p className="text-xs text-center theme-text-secondary mt-6 mb-4">
          Effective Date: February 10, 2026
        </p>
        <p className="text-xs text-center theme-text-secondary mb-4">
          By using Divine Daily, you agree to this Privacy Policy. We may update this policy occasionally - 
          changes will be posted here with a new effective date.
        </p>
      </div>
    </div>
  );
}