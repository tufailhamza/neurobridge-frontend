'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CaregiverSidebar from '../../sidebar';
import { FeedCard } from '@/types/FeedCard';
import { env } from '@/config/env';
import { StripeService } from '@/services/stripe';
import PaymentModal from '@/components/PaymentModal';
import PurchaseConfirmationModal from '@/components/PurchaseConfirmationModal';
import { useToastUtils } from '@/utils/toast';

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const { showSystemError } = useToastUtils();
  const [card, setCard] = useState<FeedCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    if (params.id) {
      const cardId = params.id as string;
      console.log('Looking for card with ID:', cardId);
      
      // Fetch the specific post from the API
      const fetchPost = async () => {
        try {
          const response = await fetch(`${env.BACKEND_URL}/posts/${cardId}`);
          if (response.ok) {
            const postData = await response.json();
            console.log('Found post from API:', postData);
            setCard(postData);
          } else {
            console.log('Post not found in API');
            setCard(null);
          }
        } catch (error) {
          console.error('Error fetching post:', error);
          setCard(null);
          showSystemError(
            "Failed to load content",
            "Please refresh the page or try again later"
          );
        } finally {
          setLoading(false);
        }
      };

      // Check if user has already purchased this content
      const checkPurchaseStatus = async () => {
        try {
          const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
          const userId = userInfo.user_id || userInfo.id;
          
          if (userId) {
            const response = await fetch(`${env.BACKEND_URL}/stripe/purchases/check/${userId}/${cardId}`);
            if (response.ok) {
              const data = await response.json();
              setHasPurchased(data.hasAccess);
            }
          }
        } catch (error) {
          console.error('Error checking purchase status:', error);
        }
      };

      fetchPost();
      checkPurchaseStatus();
    }
  }, [params.id]);

  const handlePurchase = async () => {
    console.log('Purchase button clicked, card:', card);
    
    if (!card || card.price === 0) {
      // For free content, just redirect to success
      console.log('Free content, redirecting to purchased page');
      router.push(`/clinician/purchased?contentId=${card?.id}`);
      return;
    }

    // Show payment modal for paid content
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    setProcessingPayment(true);
    setShowPaymentModal(false);
    
    try {
      console.log('Processing payment with method:', paymentMethodId);
      
      // Get the actual user ID from localStorage
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = userInfo.user_id || userInfo.id;
      
      if (!userId) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Create payment intent with saved payment method
      console.log('Creating payment intent with:', {
        amount: Math.round(card!.price * 100),
        paymentMethodId,
        metadata: {
          contentId: card!.id,
          contentType: 'post',
          userId: userId.toString(),
        }
      });

      const response = await fetch(`${env.BACKEND_URL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(card!.price * 100), // Convert to cents
          currency: 'usd',
          paymentMethodId: paymentMethodId,
          metadata: {
            contentId: card!.id,
            contentType: 'post',
            userId: userId.toString(),
          },
        }),
      });

      console.log('Payment intent response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment intent error response:', errorText);
        throw new Error(`Failed to create payment intent: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Payment intent response data:', responseData);
      
      const { clientSecret } = responseData;
      if (!clientSecret) {
        throw new Error('No client secret returned from backend');
      }

      console.log('Payment intent created and confirmed successfully on backend');
      
      // The backend already confirmed the payment with confirm=True
      // No need to confirm again on frontend
      
      // Update purchase status
      setHasPurchased(true);
      
      // Show confirmation modal instead of redirecting
      console.log('Showing confirmation modal...');
      setShowConfirmationModal(true);
      
    } catch (error) {
      console.error('Payment error:', error);
      showSystemError(
        "Payment processing failed",
        "Please try again or contact support if the issue persists"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleContinueToContent = () => {
    setShowConfirmationModal(false);
    // Stay on the same page since user already has access
  };

  const handleViewPurchased = () => {
    setShowConfirmationModal(false);
    router.push('/clinician/purchased');
  };

  // Function to get preview content (first 20% of the content)
  const getPreviewContent = (htmlContent: string): string => {
    // Simple approach: take first 1000 characters or first few paragraphs
    const maxLength = Math.min(1000, Math.floor(htmlContent.length * 0.2));
    
    // Find the end of a complete sentence or paragraph
    let preview = htmlContent.substring(0, maxLength);
    
    // Try to end at a sentence boundary
    const lastPeriod = preview.lastIndexOf('.');
    const lastParagraph = preview.lastIndexOf('</p>');
    
    if (lastParagraph > lastPeriod && lastParagraph > maxLength * 0.8) {
      preview = preview.substring(0, lastParagraph + 4);
    } else if (lastPeriod > maxLength * 0.8) {
      preview = preview.substring(0, lastPeriod + 1);
    }
    
    // Add "..." suffix to indicate there's more content
    return preview + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-d">
        <CaregiverSidebar />
        <div className="ml-64 h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-d">
        <CaregiverSidebar />
        <div className="ml-64 h-screen flex items-center justify-center">
          <div className="text-lg">Content not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-d">
      {/* Sidebar */}
      <CaregiverSidebar />
      
      {/* Main Content */}
      <div className="ml-64 h-full flex">
        
        {/* Column B - Content */}
        <div className="w-4/5 p-6">
          <div className="bg-white rounded-lg shadow-md p-8">            
            {/* Render the HTML content */}
            {card.html_content ? (
              <div>
                {hasPurchased || card.price === 0 ? (
                  // Show full content if purchased or free
                  <div 
                    dangerouslySetInnerHTML={{ __html: card.html_content }}
                    className="content-html max-w-none text-gray-900"
                  />
                ) : (
                  // Show preview content for paid posts
                  <div>
                    <div 
                      dangerouslySetInnerHTML={{ __html: getPreviewContent(card.html_content) }}
                      className="content-html max-w-none text-gray-900"
                    />
                    <div className="mt-8 p-6 bg-gray-200 py-32 rounded-lg border-2 border-gray-200">
                      <div className="text-center">
                        <h3 className="text-xl  text-gray-900 mb-3">
                          Continue reading by purchasing full access to this article
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-900 text-lg">No content available</p>
              </div>
            )}
          </div>
        </div>

        {/* Column C - Sticky */}
        <div className="w-128 p-6">
          <div className="bg-white sticky top-6">

            {/* Row 2 - Purchase */}
            <div className='border-2 border-gray-200 rounded-2xl p-6 mb-6'>
              <h3 className="text-lg font-semibold text-b mb-4">Purchase</h3>
              <div className="text-center">
                {hasPurchased ? (
                  <div className="w-full border-2 border-blue-700 text-blue-600 py-3 px-6 rounded-lg font-medium bg-white">
                    Purchased
                  </div>
                ) : (
                  <button 
                    onClick={handlePurchase}
                    disabled={processingPayment}
                    className="w-full bg-a text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingPayment ? 'Processing...' : (card.price === 0 ? 'Get Free' : `Purchase $${card.price}`)}
                  </button>
                )}
              </div>
            </div>
            
            {/* Row 3 - Tags */}
            <div className='border-2 border-gray-200 rounded-2xl p-6 mb-6'>
              <h3 className="text-lg text-b font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 border-b border-2 text-b text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={card?.price || 0}
        contentTitle={card?.title || ''}
        // card={card}
      />

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        contentTitle={card?.title || ''}
        amount={card?.price || 0}
        onContinueToContent={handleContinueToContent}
        onViewPurchased={handleViewPurchased}
      />
    </div>
  );
} 