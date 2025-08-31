'use client';

import { useState, useEffect } from 'react';
import { FeedCard as FeedCardType } from '@/types/FeedCard';
import { useRouter } from 'next/navigation';
import { env } from '@/config/env';

interface FeedCardProps {
  card: FeedCardType;
}

export default function FeedCard({ card }: FeedCardProps) {
  const router = useRouter();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loadingPurchaseStatus, setLoadingPurchaseStatus] = useState(true);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
        const userId = userInfo.user_id || userInfo.id;
        
        if (userId) {
          const response = await fetch(`${env.BACKEND_URL}/stripe/purchases/check/${userId}/${card.id}`);
          if (response.ok) {
            const data = await response.json();
            setHasPurchased(data.hasAccess);
          }
        }
      } catch (error) {
        console.error('Error checking purchase status:', error);
      } finally {
        setLoadingPurchaseStatus(false);
      }
    };

    checkPurchaseStatus();
  }, [card.id]);

  const handleCardClick = () => {
    // Determine the route based on user role (you can get this from localStorage or context)
    const userRole = JSON.parse(localStorage.getItem('user_info') || '{}');
    if (userRole.role === 'clinician') {
      router.push(`/clinician/content/${card.id}`);
    } else {
      router.push(`/caregiver/content/${card.id}`);
    }
  };

  // Check if image exists and is not empty
  const hasImage = card.image_url && card.image_url.trim() !== '';

  return (
    <div 
      className="bg-gray-50 rounded-xl p-4 border border-gray-200 pb-8 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      {/* Huge Image - Only render if image exists */}
      {hasImage && (
        <div className="w-full h-128 rounded-lg mb-4 overflow-hidden">
          <img 
            src={card.image_url} 
            alt={card.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"><span class="text-gray-500 text-lg">Content Image</span></div>';
            }}
          />
        </div>
      )}
      
      {/* Title */}
      <h3 className="text-2xl font-bold text-b mb-4">
        {card.title}
      </h3>
      
      {/* Author Info Row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-a rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {card.user_name ? card.user_name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{card.user_name}</p>
            <p className="text-sm text-gray-600">Author</p>
          </div>
        </div>
        <div className="flex flex-row space-x-2 text-right">
          <p className="text-sm font-medium text-black">{card.date}</p> 
          <p>  </p>
          <p className="text-sm font-medium text-black">{card.read_time}</p>
        </div>
      </div>
      
      {/* Tags and Price Row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex space-x-2">
          {card.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-2 border-b border-2 text-b text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        {loadingPurchaseStatus ? (
          <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium">
            Loading...
          </div>
        ) : hasPurchased ? (
          <div className="px-4 py-2 border-2 border-blue-700 text-blue-600 rounded-lg font-medium bg-white">
            Purchased
          </div>
        ) : (
          <button className="px-4 py-2 bg-a text-white rounded-lg font-medium hover:bg-a-hover transition-colors">
            {card.price === 0 ? 'Free' : `$${card.price}`}
          </button>
        )}
      </div>

    </div>
  );
} 