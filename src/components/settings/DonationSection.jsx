import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Donation tiers with their product IDs for the native app stores
const donationTiers = [
  { amount: 1, label: '$1/month', productId: 'monthly_donation_1' },
  { amount: 3, label: '$3/month', productId: 'monthly_donation_3' },
  { amount: 5, label: '$5/month', productId: 'monthly_donation_5' },
  { amount: 10, label: '$10/month', productId: 'monthly_donation_10' },
];

export default function DonationSection({ user }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const queryClient = useQueryClient();

  const currentSubscription = user?.donation_subscription;

  useEffect(() => {
    // Set up global callback for native wrapper to call when purchase completes
    window.onPurchaseComplete = async (productId, transactionId) => {
      console.log('Purchase completed:', productId, transactionId);
      
      // Find which tier was purchased
      const tier = donationTiers.find(t => t.productId === productId);
      
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
        window.onPurchaseComplete(tier.productId, 'web_test_transaction_' + Date.now());
      }, 2000);
    }
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your monthly donation?')) {
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
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl theme-card"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
          <Heart className="w-5 h-5 text-pink-600" />
        </div>
        <h2 className="text-lg font-bold theme-text-primary">Support This App</h2>
      </div>

      <p className="text-sm theme-text-secondary mb-4 leading-relaxed">
        Help keep this app running smoothly and available to everyone. Your contribution is deeply appreciated, however not required. We want to make this app accessible to all.
      </p>

      {currentSubscription && currentSubscription.status === 'active' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-slate-800">Active Supporter</span>
            </div>
            <p className="text-sm text-slate-600">
              Thank you for donating ${currentSubscription.amount}/month! Your support means the world to us.
            </p>
          </div>

          <button
            onClick={handleCancelSubscription}
            className="w-full py-3 px-4 rounded-xl font-medium theme-text-secondary border-2"
            style={{ borderColor: 'var(--border-color)' }}
          >
            Cancel Subscription
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {donationTiers.map((tier) => (
            <button
              key={tier.productId}
              onClick={() => handleDonationSelect(tier)}
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
  );
}