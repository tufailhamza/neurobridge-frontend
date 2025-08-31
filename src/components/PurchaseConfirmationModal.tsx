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
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            
            <div>
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
        <div className="px-6 pb-6 pt-2">
          <div className=" mb-8">            
            <h3 className="text-xl font-semibold text-b mb-2">
              Thank you for your purchase!
            </h3>
            <p className="text-gray-600 mb-4">
              You have successfully purchased <strong>{contentTitle}</strong> for ${amount}.
            </p>          
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onContinueToContent}
              className="w-full bg-a text-white py-3 px-6 rounded-lg font-medium hover:bg-a transition-colors flex items-center justify-center gap-2"
            >
              Continue to Content
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
}
