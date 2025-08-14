'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CaregiverSidebar from '../../sidebar';
import { FeedCard } from '@/types/FeedCard';
import { env } from '@/config/env';

export default function ContentPage() {
  const params = useParams();
  const [card, setCard] = useState<FeedCard | null>(null);
  const [loading, setLoading] = useState(true);

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
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
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
            {card.html_content ? (
              <div 
                dangerouslySetInnerHTML={{ __html: card.html_content }}
                className="content-html max-w-none text-gray-900"
              />
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
                <button className="w-full bg-a text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                  {card.price === 0 ? 'Free' : `$${card.price}`}
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