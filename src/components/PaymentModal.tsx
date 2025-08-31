'use client';

import { X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethodId: string) => void;
  amount: number;
  contentTitle: string;
  card?: any; // Add card prop to access additional content info
}

const PaymentModal = ({ isOpen, onClose, card, onSuccess, amount, contentTitle }: PaymentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header Row - Purchase text and cross icon */}
        <div className="flex justify-between items-center p-6">
          <span className="text-sm font-medium text-gray-600">Purchase</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{contentTitle}</h2>
          
          {/* Author Name */}
          {card?.user_name && (
            <p className="text-sm text-gray-600 mb-6">{card.user_name}</p>
          )}
          
          {/* Total Row */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-semibold text-gray-900">${amount}</span>
          </div>

          {/* Purchase Button */}
          <button 
            className="w-full bg-a text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            onClick={() => onSuccess('direct-purchase')}
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
