'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import ClinicianSidebar from '../sidebar';
import { env } from '@/config/env';

// Initialize Stripe
const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
function PaymentForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Payment failed');
        return;
      }

      // Get user info
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) {
        setError('User information not found');
        return;
      }

      const user = JSON.parse(userInfo);

      // Send payment method to your backend
      const response = await fetch(`${env.BACKEND_URL}/stripe/create-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          email: user.email,
          payment_method_id: paymentMethod.id
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Payment failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-md p-3">
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

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 px-4 py-2 bg-b text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
}

export default function ClinicianSettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check if user already has a Stripe customer ID
  useEffect(() => {
    const checkStripeCustomer = async () => {
      try {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          const response = await fetch(`${env.BACKEND_URL}/stripe/customer/${user.user_id}`);
          if (response.ok) {
            const customerData = await response.json();
            setStripeCustomerId(customerData.stripe_customer_id);
          }
        }
      } catch (error) {
        console.error('Error checking Stripe customer:', error);
      }
    };

    checkStripeCustomer();
  }, []);

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      console.log('Deleting account...');
    }
  };

  const handleAddCard = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setStripeCustomerId('temp_id'); // You'll get the real ID from your backend
    alert('Payment method added successfully!');
  };

  const handleLinkBankAccount = async () => {
    setLoading(true);
    try {
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) {
        alert('User information not found. Please log in again.');
        return;
      }

      const user = JSON.parse(userInfo);
      
      const response = await fetch(`${env.BACKEND_URL}/stripe/create-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          email: user.email
        })
      });

      if (response.ok) {
        const customerData = await response.json();
        setStripeCustomerId(customerData.stripe_customer_id);
        alert('Bank account linked successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', errorData);
        alert(`Failed to link bank account: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error linking bank account:', error);
      alert('Failed to link bank account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-d">
      <ClinicianSidebar />
      
      <div className="ml-64 flex bg-d">
        <div className="w-full p-6 bg-d">
          <div className="max-w-4xl">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-b">Settings</h1>
            </div>

            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'account'
                        ? 'border-b text-b'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Account
                  </button>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'payment'
                        ? 'border-b text-b'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Payment Method
                  </button>
                </nav>
              </div>
            </div>

            <div className="bg-white rounded-lg border-gray-200">
              {activeTab === 'account' && (
                <div className="border rounded-xl">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-b">Delete Account</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        This will permanently delete your account and all content that was created
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="ml-4 px-4 py-2 border-2 border-b text-b font-semibold rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="">
                  <div className="flex items-center justify-between p-4 border rounded-xl border-gray-100">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-b">Add Card</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {stripeCustomerId ? 'Payment method connected successfully!' : 'To purchase content youll need to add a debit or credit card.'}
                      </p>
                    </div>
                    <button
                      onClick={handleAddCard}
                      disabled={loading || !!stripeCustomerId}
                      className={`ml-4 px-5 py-2 font-semibold rounded-lg ${
                        stripeCustomerId 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-a text-white hover:bg-opacity-90'
                      }`}
                    >
                      {loading ? 'Processing...' : stripeCustomerId ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-xl border-gray-100 mt-8">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-b">Link Account</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {stripeCustomerId ? 'Bank account linked successfully!' : 'To recieve payouts for your content please link a bank account'}
                      </p>
                    </div>
                    <button
                      onClick={handleLinkBankAccount}
                      disabled={loading || !!stripeCustomerId}
                      className={`ml-4 px-5 py-2 font-semibold rounded-lg ${
                        stripeCustomerId 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-a text-white hover:bg-opacity-90'
                      }`}
                    >
                      {loading ? 'Linking...' : stripeCustomerId ? 'Linked' : 'Connect'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-b mb-4">Add Payment Card</h2>
            
            <Elements stripe={stripePromise}>
              <PaymentForm 
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
} 