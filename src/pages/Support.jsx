import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check, Loader2, ArrowLeft, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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

// Donation tiers with their product IDs for the native app stores
const donationTiers = [
  { amount: 1, label: '$1/month', productId: 'monthly_donation_1' },
  { amount: 3, label: '$3/month', productId: 'monthly_donation_3' },
  { amount: 5, label: '$5/month', productId: 'monthly_donation_5' },
  { amount: 10, label: '$10/month', productId: 'monthly_donation_10' },
];

const oneTimeDonations = [
  { amount: 25, label: '$25', productId: 'one_time_donation_25' },
  { amount: 50, label: '$50', productId: 'one_time_donation_50' },
];

export default function Support() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showOneTime, setShowOneTime] = useState(false);
  const queryClient = useQueryClient();

  const currentSubscription = user?.donation_subscription;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    // Set up global callback for native wrapper to call when purchase completes
    window.onPurchaseComplete = async (productId, transactionId) => {
      console.log('Purchase completed:', productId, transactionId);
      
      // Check if it's a monthly subscription
      const tier = donationTiers.find(t => t.productId === productId);
      // Check if it's a one-time donation
      const oneTime = oneTimeDonations.find(t => t.productId === productId);
      
      if (tier) {
        // Update user data with subscription info
        await base44.auth.updateMe({
          donation_subscription: {
            product_id: productId,
            amount: tier.amount,
            transaction_id: transactionId,
            started_date: new Date().toISOString(),
            status: 'active'
          }
        });
        
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        // Reload user data
        const userData = await base44.auth.me();
        setUser(userData);
      } else if (oneTime) {
        // Track one-time donation
        const donations = user?.one_time_donations || [];
        await base44.auth.updateMe({
          one_time_donations: [
            ...donations,
            {
              product_id: productId,
              amount: oneTime.amount,
              transaction_id: transactionId,
              date: new Date().toISOString()
            }
          ]
        });
        
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        // Reload user data
        const userData = await base44.auth.me();
        setUser(userData);
        
        alert(`Thank you for your ${oneTime.label} donation! 🙏`);
      }
      
      setIsPurchasing(false);
    };

    // Set up callback for purchase failure
    window.onPurchaseFailed = (productId, error) => {
      console.error('Purchase failed:', productId, error);
      setIsPurchasing(false);
      alert('Purchase could not be completed. Please try again.');
    };

    // Set up callback for cancellation complete
    window.onCancellationComplete = async () => {
      console.log('Subscription cancelled');
      
      // Update user data to reflect cancelled subscription
      await base44.auth.updateMe({
        donation_subscription: {
          ...user?.donation_subscription,
          status: 'cancelled',
          cancelled_date: new Date().toISOString()
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Reload user data
      const userData = await base44.auth.me();
      setUser(userData);
    };

    return () => {
      delete window.onPurchaseComplete;
      delete window.onPurchaseFailed;
      delete window.onCancellationComplete;
    };
  }, [user, queryClient]);

  const handleDonationSelect = (tier) => {
    setSelectedTier(tier);
    setIsPurchasing(true);

    // Check if running in iOS wrapper
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.purchaseProduct) {
      window.webkit.messageHandlers.purchaseProduct.postMessage({
        productId: tier.productId,
        amount: tier.amount
      });
    }
    // Check if running in Android wrapper
    else if (window.Android && window.Android.purchaseProduct) {
      window.Android.purchaseProduct(tier.productId, tier.amount);
    }
    // Fallback for web/testing - simulate success after 2 seconds
    else {
      console.log('Native wrapper not detected. Simulating purchase for:', tier.productId);
      setTimeout(() => {
        if (window.onPurchaseComplete) {
          window.onPurchaseComplete(tier.productId, 'web_test_transaction_' + Date.now());
        }
      }, 2000);
    }
  };

  const handleCancelSubscription = () => {
    // Check if running in iOS wrapper
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cancelSubscription) {
      window.webkit.messageHandlers.cancelSubscription.postMessage({
        productId: currentSubscription.product_id
      });
    }
    // Check if running in Android wrapper
    else if (window.Android && window.Android.cancelSubscription) {
      window.Android.cancelSubscription(currentSubscription.product_id);
    }
    // Fallback for web/testing
    else {
      console.log('Native wrapper not detected. Simulating cancellation');
      setTimeout(() => {
        window.onCancellationComplete();
      }, 1000);
    }
    setShowCancelDialog(false);
  };

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
          <h1 className="text-xl font-bold theme-text-primary">Support This App</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl theme-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697fc0c062ab93dbdcdf4611/2d764fa06_heart.jpg" 
                alt="Support"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-lg font-bold theme-text-primary">Monthly Donation</h2>
          </div>

          <p className="text-sm theme-text-secondary mb-6 leading-relaxed">
            Help keep this app running smoothly and available to everyone. Your contribution is deeply appreciated, however not required. We want to make this app accessible to all.
          </p>

          {currentSubscription && currentSubscription.status === 'active' ? (
            <div className="space-y-4">
              <div 
                className="p-4 rounded-2xl border-2"
                style={{
                  background: `linear-gradient(to bottom right, var(--accent-primary), var(--accent-secondary))`,
                  borderColor: 'var(--accent-primary)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  <span className="font-semibold theme-text-primary">Active Supporter</span>
                </div>
                <p className="text-sm theme-text-secondary">
                  Thank you for donating ${currentSubscription.amount}/month! Your support means the world to us.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCancelDialog(true)}
                className="w-full py-3 px-4 rounded-xl font-semibold border-2 hover:opacity-80 transition-colors"
                style={{ 
                  borderColor: 'var(--text-primary)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)'
                }}
              >
                Cancel Subscription
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              {donationTiers.map((tier) => (
                <button
                  key={tier.productId}
                  onClick={() => {
                    handleDonationSelect(tier);
                    navigate(createPageUrl('Settings'));
                  }}
                  disabled={isPurchasing}
                  className="w-full p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ 
                    borderColor: isPurchasing && selectedTier?.productId === tier.productId 
                      ? '#ec4899' 
                      : 'var(--border-color)',
                    backgroundColor: isPurchasing && selectedTier?.productId === tier.productId
                      ? 'rgba(236, 72, 153, 0.1)'
                      : 'transparent'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-semibold theme-text-primary">{tier.label}</p>
                      <p className="text-xs theme-text-secondary">Monthly donation</p>
                    </div>
                    {isPurchasing && selectedTier?.productId === tier.productId && (
                      <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
                    )}
                  </div>
                </button>
              ))}

              {currentSubscription && currentSubscription.status === 'cancelled' && (
                <p className="text-xs text-center theme-text-secondary mt-2">
                  Your previous subscription was cancelled. You can start a new one anytime.
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* One-Time Donation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 rounded-3xl overflow-hidden theme-card"
        >
          <button
            onClick={() => setShowOneTime(!showOneTime)}
            className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <div className="text-left">
              <h3 className="font-semibold theme-text-primary">One-Time Donation</h3>
              <p className="text-xs theme-text-secondary">Make a single contribution</p>
            </div>
            <ChevronDown 
              className={`w-5 h-5 theme-text-secondary transition-transform ${showOneTime ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {showOneTime && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {oneTimeDonations.map((donation) => (
                    <button
                      key={donation.productId}
                      onClick={() => {
                        handleDonationSelect(donation);
                        navigate(createPageUrl('Settings'));
                      }}
                      disabled={isPurchasing}
                      className="w-full p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{ 
                        borderColor: isPurchasing && selectedTier?.productId === donation.productId 
                          ? '#ec4899' 
                          : 'var(--border-color)',
                        backgroundColor: isPurchasing && selectedTier?.productId === donation.productId
                          ? 'rgba(236, 72, 153, 0.1)'
                          : 'transparent'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="font-semibold theme-text-primary">{donation.label}</p>
                          <p className="text-xs theme-text-secondary">One-time donation</p>
                        </div>
                        {isPurchasing && selectedTier?.productId === donation.productId && (
                          <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent 
          className="max-w-[90%] rounded-2xl border-2" 
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)'
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="theme-text-primary">Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription className="theme-text-secondary">
              Are you sure you want to cancel your monthly donation? You can always resubscribe later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              className="w-full sm:w-auto font-semibold border-2"
              style={{ 
                borderColor: 'var(--text-light)',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent'
              }}
            >
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelSubscription}
              className="w-full sm:w-auto font-bold"
              style={{ 
                backgroundColor: 'var(--accent-primary)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--text-primary)'
              }}
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}