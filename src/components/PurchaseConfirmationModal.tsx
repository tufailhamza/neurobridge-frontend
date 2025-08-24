'use client';

import { CheckCircle, ArrowRight, X } from 'lucide-react';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle: string;
  amount: number;
  onContinueToContent: () => void;
  onViewPurchased: () => void;
}

export default function PurchaseConfirmationModal({
  isOpen,
  onClose,
  contentTitle,
  amount,
  onContinueToContent,
  onViewPurchased,
}: PurchaseConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-green-500">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Purchase Successful!</h2>
              <p className="text-sm text-gray-600">Payment completed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-green-500 mb-4">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Thank you for your purchase!
            </h3>
            <p className="text-gray-600 mb-4">
              You have successfully purchased <strong>{contentTitle}</strong> for ${amount}.
            </p>
            <p className="text-sm text-gray-500">
              You can now access this content anytime from your purchased content library.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onContinueToContent}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Continue to Content
              <ArrowRight size={20} />
            </button>
            
            <button
              onClick={onViewPurchased}
              className="w-full border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors"
            >
              View All Purchased Content
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-500 py-2 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
