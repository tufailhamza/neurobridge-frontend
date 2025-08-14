'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CaregiverSidebar from '../../sidebar';
import { feedCards } from '@/data/feedCards';
import { FeedCard } from '@/types/FeedCard';

export default function ContentPage() {
  const params = useParams();
  const [card, setCard] = useState<FeedCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('card', params);
    const cardId = params.id as string;
    const foundCard = feedCards.find(c => c.id === cardId);
    setCard(foundCard || null);
    setLoading(false);
  }, [params.id]);

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
            <div 
              dangerouslySetInnerHTML={{ __html: card.html_content }}
              className="prose max-w-none"
            />
          </div>
        </div>

        {/* Column C - Sticky */}
        <div className="w-128 p-6">
          <div className="bg-white sticky top-6">

            {/* Row 2 - Purchase */}
            <div className='border-2 border-gray-200 rounded-2xl p-6 mb-6'>
              <h3 className="text-lg font-semibold text-b mb-4">Purchase</h3>
              <div className="text-center">
                <button className="w-full bg-a text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                ${card.price}
                </button>
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
    </div>
  );
} 