'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CaregiverSidebar from '../../sidebar';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { env } from '@/config/env';

// Separate component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const contentId = searchParams.get('contentId');
  const paymentIntentId = searchParams.get('payment_intent_id');

  useEffect(() => {
    const verifyPayment = async () => {
      // For saved card payments, we don't have a session ID, so we'll skip verification
      // The payment was already confirmed on the backend
      if (!sessionId && !paymentIntentId) {
        console.log('No session ID or payment intent ID found - payment was likely confirmed on backend');
        setLoading(false);
        return;
      }

      if (sessionId) {
        try {
          // Verify the payment with your backend (for checkout sessions)
          const response = await fetch(`${env.BACKEND_URL}/stripe/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });

          if (!response.ok) {
            throw new Error('Payment verification failed');
          }

          const result = await response.json();
          
          if (result.success) {
            // Payment verified successfully
            setLoading(false);
          } else {
            setError('Payment verification failed');
            setLoading(false);
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          setError('Failed to verify payment');
          setLoading(false);
        }
      } else {
        // For payment intents, the payment was already confirmed on the backend
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, paymentIntentId]);

  const handleContinue = () => {
    if (contentId) {
      router.push(`/caregiver/content/${contentId}`);
    } else {
      router.push('/caregiver/home');
    }
  };

  const handleViewPurchased = () => {
    router.push('/caregiver/purchased');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-d">
        <CaregiverSidebar />
        <div className="ml-64 h-screen flex items-center justify-center">
          <div className="text-lg">Verifying payment...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-d">
        <CaregiverSidebar />
        <div className="ml-64 h-screen flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/caregiver/home')}
              className="bg-a text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-d">
      <CaregiverSidebar />
      <div className="ml-64 h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="text-green-500 mb-4">
            <CheckCircle size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your purchase has been completed successfully. You can now access your content.
          </p>
          
          <div className="space-y-3">
            {contentId && (
              <button
                onClick={handleContinue}
                className="w-full bg-a text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
              >
                Continue to Content
                <ArrowRight size={20} />
              </button>
            )}
            
            <button
              onClick={handleViewPurchased}
              className="w-full border-2 border-a text-a py-3 px-6 rounded-lg font-medium hover:bg-a hover:text-white transition-colors"
            >
              View All Purchased Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
