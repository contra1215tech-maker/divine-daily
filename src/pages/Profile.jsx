import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User as UserIcon, Calendar, LogOut, Shield, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Delete all user data entities
      const entries = await base44.entities.JournalEntry.list();
      await Promise.all(entries.map(e => base44.entities.JournalEntry.delete(e.id)));
      const folders = await base44.entities.JournalFolder.list();
      await Promise.all(folders.map(f => base44.entities.JournalFolder.delete(f.id)));
      const bookmarks = await base44.entities.Bookmark.list();
      await Promise.all(bookmarks.map(b => base44.entities.Bookmark.delete(b.id)));
      const favorites = await base44.entities.FavoriteVerse.list();
      await Promise.all(favorites.map(v => base44.entities.FavoriteVerse.delete(v.id)));
      const comments = await base44.entities.VerseComment.list();
      await Promise.all(comments.map(c => base44.entities.VerseComment.delete(c.id)));
    } catch (e) {
      console.error('Error deleting data:', e);
    }
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-xl font-bold theme-text-primary">Profile</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* User Info Cards */}
        <div className="space-y-3 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl theme-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
                <UserIcon className="w-5 h-5 theme-text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs theme-text-secondary">Full Name</p>
                <p className="font-semibold theme-text-primary">{user?.full_name || 'Not set'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl theme-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
                <Mail className="w-5 h-5 theme-text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs theme-text-secondary">Email</p>
                <p className="font-semibold theme-text-primary">{user?.email}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl theme-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
                <Shield className="w-5 h-5 theme-text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs theme-text-secondary">Account Type</p>
                <p className="font-semibold theme-text-primary capitalize">{user?.role || 'User'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl theme-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
                <Calendar className="w-5 h-5 theme-text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs theme-text-secondary">Member Since</p>
                <p className="font-semibold theme-text-primary">
                  {user?.created_date ? format(new Date(user.created_date), 'MMMM d, yyyy') : 'Unknown'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sign Out Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl theme-card flex items-center justify-center gap-3 mt-8 select-none"
        >
          <LogOut className="w-5 h-5 theme-text-primary" />
          <span className="font-semibold theme-text-primary">Sign Out</span>
        </motion.button>

        {/* Delete Account */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDeleteDialog(true)}
          className="w-full p-4 rounded-2xl flex items-center justify-center gap-3 select-none border-2 border-red-300"
          style={{ backgroundColor: 'rgba(239,68,68,0.07)' }}
        >
          <Trash2 className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-red-500">Delete Account</span>
        </motion.button>

        {/* Info Text */}
        <p className="text-xs text-center theme-text-secondary mt-6">
          To enable Google or Apple sign-in, configure OAuth providers in your Base44 dashboard settings.
        </p>
      </div>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90%] rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="theme-text-primary">Delete Account?</AlertDialogTitle>
            <AlertDialogDescription className="theme-text-secondary">
              This will permanently delete all your journal entries, bookmarks, highlights, and account data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-500 text-white"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}