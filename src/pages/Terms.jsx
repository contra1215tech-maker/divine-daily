import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function Terms() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: 'By accessing or using Divine Daily ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App. We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the modified Terms.'
    },
    {
      icon: CheckCircle,
      title: 'Description of Service',
      content: 'Divine Daily is a free mobile application that provides Bible reading, personal journaling with photo capture, and spiritual reflection features. The App uses third-party services including Base44 (backend infrastructure) and Bolls Life Bible API (scripture content). Internet access is required for full functionality.'
    },
    {
      icon: Shield,
      title: 'User Accounts',
      content: 'You must create an account to use the App. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information and keep it updated. You agree to notify us immediately of any unauthorized account use. You must be at least 13 years old (or 16 in certain regions) to create an account.'
    },
    {
      icon: AlertCircle,
      title: 'User Content & Ownership',
      content: 'You retain all ownership rights to content you create in the App (journal entries, photos, reflections, comments). By using the App, you grant us a limited license to store, process, and display your content solely to provide the App\'s services to you. You are responsible for your content and must ensure it does not violate any laws or third-party rights. We reserve the right to remove content that violates these Terms or applicable laws.'
    },
    {
      icon: AlertCircle,
      title: 'Prohibited Uses',
      content: 'You agree not to: (a) use the App for any illegal purpose or in violation of any laws; (b) attempt to gain unauthorized access to the App or its systems; (c) interfere with or disrupt the App\'s functionality; (d) upload malicious code, viruses, or harmful content; (e) impersonate others or misrepresent your affiliation; (f) collect or harvest data from other users without consent; (g) use the App to harass, abuse, or harm others.'
    },
    {
      icon: FileText,
      title: 'Third-Party Services',
      content: 'The App relies on third-party services (Base44 for backend infrastructure, Bolls Life for Bible content, Apple/Google for in-app purchases). These services have their own terms and privacy policies. We are not responsible for the availability, accuracy, or content of third-party services. Your use of these services is subject to their respective terms.'
    },
    {
      icon: Shield,
      title: 'Donations',
      content: 'Optional monthly donations are processed through Apple/Google In-App Purchases and are non-refundable except as required by law or the app store\'s policies. Donations do not unlock additional features and are voluntary contributions to support App development and maintenance. Subscription management and cancellation are handled through your Apple/Google account settings.'
    },
    {
      icon: AlertCircle,
      title: 'Disclaimer of Warranties',
      content: 'THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. We do not guarantee the App will be error-free, uninterrupted, secure, or meet your requirements. We disclaim all warranties including merchantability, fitness for a particular purpose, and non-infringement. The Bible content is provided for informational and spiritual purposes only and should not replace professional religious guidance.'
    },
    {
      icon: AlertCircle,
      title: 'Limitation of Liability',
      content: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA, REVENUE, OR PROFITS, ARISING FROM YOUR USE OF THE APP. Our total liability shall not exceed the amount you paid to us in the past 12 months (if any). Some jurisdictions do not allow these limitations, so they may not apply to you.'
    },
    {
      icon: FileText,
      title: 'Termination',
      content: 'You may stop using the App at any time and request account deletion by contacting us at divinedailytech@gmail.com. We may suspend or terminate your access to the App at any time, with or without notice, for violation of these Terms or for any other reason. Upon termination, your right to use the App ceases, but provisions regarding user content ownership, disclaimers, and limitations of liability survive.'
    },
    {
      icon: CheckCircle,
      title: 'Intellectual Property',
      content: 'The App, including its design, features, code, and trademarks, is owned by us and protected by copyright and intellectual property laws. The Bible text is provided by third-party sources (Bolls Life API) and may have separate copyright considerations. You may not copy, modify, distribute, or reverse engineer the App without our permission.'
    },
    {
      icon: Shield,
      title: 'Governing Law',
      content: 'These Terms are governed by and construed in accordance with the laws of the jurisdiction where the App owner is located, without regard to conflict of law principles. Any disputes shall be resolved in the courts of that jurisdiction. If any provision of these Terms is found invalid, the remaining provisions remain in full effect.'
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
          <h1 className="text-xl font-bold theme-text-primary">Terms of Service</h1>
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
              <FileText className="w-6 h-6 theme-text-primary" />
            </div>
            <h2 className="text-lg font-bold theme-text-primary">Terms & Conditions</h2>
          </div>
          <p className="text-sm theme-text-secondary leading-relaxed">
            Welcome to Divine Daily. These Terms of Service govern your use of our Bible reading and journaling app. 
            Please read them carefully. By using Divine Daily, you acknowledge that you have read, understood, and agree 
            to be bound by these Terms.
          </p>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-3">
          {sections.map((section, index) => {
            const Icon = section.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-5 rounded-2xl theme-card"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 theme-text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold theme-text-primary mb-2">{section.title}</h3>
                    <p className="text-sm theme-text-secondary leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-5 rounded-2xl theme-card"
        >
          <h3 className="font-semibold theme-text-primary mb-3">Questions or Concerns?</h3>
          <p className="text-sm theme-text-secondary leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at{' '}
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
          By using Divine Daily, you agree to these Terms of Service. We may update these Terms from time to time - 
          changes will be posted here with a new effective date.
        </p>
      </div>
    </div>
  );
}