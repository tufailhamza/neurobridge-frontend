'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import CaregiverSidebar from '../../sidebar';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

// Separate component that uses useSearchParams
function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const contentId = searchParams.get('contentId');

  const handleTryAgain = () => {
    if (contentId) {
      router.push(`/caregiver/content/${contentId}`);
    } else {
      router.push('/caregiver/home');
    }
  };

  const handleGoHome = () => {
    router.push('/caregiver/home');
  };

  return (
    <div className="min-h-screen bg-d">
      <CaregiverSidebar />
      <div className="ml-64 h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="text-orange-500 mb-4">
            <XCircle size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. You can try again or browse other content.
          </p>
          
          <div className="space-y-3">
            {contentId && (
              <button
                onClick={handleTryAgain}
                className="w-full bg-a text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
              >
                Try Again
                <ArrowLeft size={20} />
              </button>
            )}
            
            <button
              onClick={handleGoHome}
              className="w-full border-2 border-a text-a py-3 px-6 rounded-lg font-medium hover:bg-a hover:text-white transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
