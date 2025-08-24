'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { env } from '@/config/env';
import { X, CreditCard, Save } from 'lucide-react';

// Load Stripe
const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethodId: string) => void;
  amount: number;
  contentTitle: string;
}

interface CardFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onCancel: () => void;
  amount: number;
  contentTitle: string;
}

const CardForm = ({ onSuccess, onCancel, amount, contentTitle }: CardFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(true);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          // You can add billing details here if needed
        },
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentMethod) {
        // Save card to backend if user wants to
        if (saveCard) {
          try {
            // Get user ID from localStorage
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            const userId = userInfo.user_id || userInfo.id;
            
            const response = await fetch(`${env.BACKEND_URL}/stripe/save-payment-method`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentMethodId: paymentMethod.id,
                user_id: userId,
              }),
            });

            if (!response.ok) {
              console.warn('Failed to save payment method, but continuing with purchase');
            }
          } catch (error) {
            console.warn('Error saving payment method:', error);
          }
        }

        onSuccess(paymentMethod.id);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="saveCard"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="saveCard" className="text-sm text-gray-700">
            Save this card for future purchases
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard size={16} />
              <span>Pay ${amount}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, onSuccess, amount, contentTitle }: PaymentModalProps) => {
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchSavedCards();
      setShowCardForm(false); // Reset to saved cards view when modal opens
    }
  }, [isOpen]);

  const fetchSavedCards = async () => {
    try {
      setLoadingCards(true);
      
      // Get user ID from localStorage
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = userInfo.user_id || userInfo.id;
      
      const response = await fetch(`${env.BACKEND_URL}/stripe/payment-methods?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Payment methods response:', data);
        // Backend returns 'payment_methods', frontend expects 'paymentMethods'
        setSavedCards(data.payment_methods || data.paymentMethods || []);
      } else {
        console.log('No saved cards found or endpoint not implemented');
        setSavedCards([]);
      }
    } catch (error) {
      console.error('Error fetching saved cards:', error);
      setSavedCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleUseSavedCard = async (paymentMethodId: string) => {
    onSuccess(paymentMethodId);
  };

  const [showCardForm, setShowCardForm] = useState(false);

  const handleAddNewCard = () => {
    setShowCardForm(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Complete Purchase</h2>
            <p className="text-sm text-gray-600">{contentTitle}</p>
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="text-lg font-semibold text-gray-900">${amount}</span>
            </div>
          </div>

          {loadingCards ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading saved cards...</p>
            </div>
          ) : showCardForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Add New Card</h3>
                <button
                  onClick={() => setShowCardForm(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to saved cards
                </button>
              </div>
              
              <Elements stripe={stripePromise}>
                <CardForm
                  onSuccess={onSuccess}
                  onCancel={() => setShowCardForm(false)}
                  amount={amount}
                  contentTitle={contentTitle}
                />
              </Elements>
            </div>
          ) : savedCards.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Saved Cards</h3>
              
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => handleUseSavedCard(card.id)}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard size={20} className="text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        •••• •••• •••• {card.card.last4}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires {card.card.exp_month}/{card.card.exp_year}
                      </p>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                      Use
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={handleAddNewCard}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard size={16} />
                  <span>Add New Card</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CreditCard size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No saved cards found</p>
              </div>
              
              <Elements stripe={stripePromise}>
                <CardForm
                  onSuccess={onSuccess}
                  onCancel={onClose}
                  amount={amount}
                  contentTitle={contentTitle}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
