'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClinicianSidebar from '../sidebar';
import PaidCard from '@/components/PaidCard';
import { PaidCard as PaidCardType } from '@/types/PaidCard';
import { env } from '@/config/env';

export default function ClinicianPurchasedPage() {
  const router = useRouter();
  const [paidCards, setpaidCards] = useState<PaidCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch purchased content from backend
  useEffect(() => {
    const fetchPurchasedData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user info from localStorage
        const userInfo = localStorage.getItem('user_info');
        if (!userInfo) {
          throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userInfo);
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Fetch purchased content for the current user
        const response = await fetch(`${env.BACKEND_URL}/stripe/purchases/${user.user_id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized. Please log in again.');
          } else if (response.status === 403) {
            throw new Error('Access forbidden. Please check your permissions.');
          } else if (response.status === 404) {
            // No purchases found, set empty array
            setpaidCards([]);
            return;
          } else {
            throw new Error(`Failed to fetch purchases: ${response.status}`);
          }
        }

        const data = await response.json();
        console.log('Purchased data from backend:', data);
        setpaidCards(data || []);
      } catch (err) {
        console.error('Error fetching purchased data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch purchased data');
        // Fallback to empty array if API fails
        setpaidCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedData();
  }, []);

  return (
    <div className="h-full bg-d">
      {/* Sidebar */}
      <ClinicianSidebar />
      
      {/* Main Content */}
      <div className="ml-64 h-full flex">
        
        {/* Column B - Scrollable */}
        <div className="w-4/5 p-6 ">
          <div className=" rounded-lg h-full">
            <div className="flex space-x-4 mb-6">
                <div className="bg-b text-white px-4 py-2 rounded-full">
                    My Purchases
                </div>
                <div className="border-2 border-b text-b px-4 py-2 rounded-full">
                    All Content
                </div>
            </div>
            {/* Scrollable Cards List */}
            <div className="space-y-6 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-b mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading purchased content...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-b text-white rounded-lg hover:bg-b-hover transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : paidCards.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No purchased content found.</p>
                </div>
              ) : (
                paidCards.map((card) => (
                  <PaidCard key={card.id} card={card} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column C - Sticky - Only Filters */}
        <div className="w-128 p-6">
          <div className="bg-white sticky top-6">
            {/* Filters Header */}
            <div className="mb-6 border-gray-200 border-2 rounded-2xl p-6">
              {/* Inner row - Title and Icon */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-400 mb-4">Filters</h3>
                <div className="w-6 h-6">
                  <svg className="w-full h-full text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </div>
              </div>
              
              {/* Inner row - Clinician and Content dropdowns */}
              <div className="flex space-x-3 mb-3">
                <div className="flex-1">
                  <select className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent font-semibold appearance-none bg-white pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1L6 6L11 1' stroke='%2313375B' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center'
                    }}
                  >
                    <option>Clinician</option>
                    <option>Dr. Smith</option>
                    <option>Dr. Johnson</option>
                    <option>Dr. Williams</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent font-semibold appearance-none bg-white pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1L6 6L11 1' stroke='%2313375B' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center'
                    }}
                  >
                    <option>Content</option>
                    <option>Articles</option>
                    <option>Videos</option>
                    <option>Podcasts</option>
                  </select>
                </div>
              </div>
              
              {/* Inner row - Diagnosis and State dropdowns */}
              <div className="flex space-x-3">
                <div className="flex-1">
                  <select className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent font-semibold appearance-none bg-white pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1L6 6L11 1' stroke='%2313375B' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center'
                    }}
                  >
                    <option>Diagnosis</option>
                    <option>Alzheimer's</option>
                    <option>Dementia</option>
                    <option>Parkinson's</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent font-semibold appearance-none bg-white pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1L6 6L11 1' stroke='%2313375B' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center'
                    }}
                  >
                    <option>State</option>
                    <option>California</option>
                    <option>New York</option>
                    <option>Texas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
