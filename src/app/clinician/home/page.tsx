'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CaregiverSidebar from '../sidebar';
import FeedCard from '@/components/FeedCard';
import { feedCards } from '@/data/feedCards';

export default function CaregiverProfilePage() {
  const router = useRouter();

  return (
    <div className="h-full bg-d">
      {/* Sidebar */}
      <CaregiverSidebar />
      
      {/* Main Content */}
      <div className="ml-64 h-full flex">
        
        {/* Column B - Scrollable */}
        <div className="w-4/5 p-6 ">
          <div className=" rounded-lg h-full">
            <div className="flex space-x-4 mb-6">
                <div className="bg-b text-white px-4 py-2 rounded-full">
                    My Feed
                </div>
                <div className="border-2 border-b text-b px-4 py-2 rounded-full">
                    Discover
                </div>
            </div>
            {/* Scrollable Cards List */}
            <div className="space-y-6  overflow-y-auto">
              {feedCards.map((card) => (
                <FeedCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        </div>

        {/* Column C - Sticky */}
        <div className="w-128 p-6">
          <div className="bg-white sticky top-6">
            {/* Row 1 - Filters Header */}
            <div className="mb-6 border-gray-200 border-2 rounded-2xl p-6">
              {/* Inner row - Title and Icon */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <div className="w-6 h-6">
                  <svg className="w-full h-full text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </div>
              </div>
              
              {/* Inner row - Clinician and Content dropdowns */}
              <div className="flex space-x-3 mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-b mb-1">Clinician</label>
                  <select className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent">
                    <option>Clinician</option>
                    <option>Dr. Smith</option>
                    <option>Dr. Johnson</option>
                    <option>Dr. Williams</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-b mb-1">Content</label>
                  <select className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent">
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
                  <label className="block text-sm font-medium text-b mb-1">Diagnosis</label>
                  <select className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent">
                    <option>Diagnosis</option>
                    <option>Alzheimer's</option>
                    <option>Dementia</option>
                    <option>Parkinson's</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-b mb-1">State</label>
                  <select className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent">
                    <option>State</option>
                    <option>California</option>
                    <option>New York</option>
                    <option>Texas</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Row 2 - Clinicians you may know */}
            <div className='border-2 border-gray-200 rounded-2xl p-6'>
              <h3 className="text-lg text-gray-400 mb-4">Clinicians you may be interested in</h3>
              
              {/* Vertical list of clinicians */}
              <div className="space-y-3">
                {/* Clinician 1 */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-b rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">DS</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Dr. Sarah Smith</div>
                      <div className="text-sm text-gray-600">Neurologist</div>
                    </div>
                  </div>
                  <button className="px-3 py-1  text-b text-sm">
                    Subscribe
                  </button>
                </div>
                
                {/* Clinician 2 */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-b rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">MJ</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Dr. Michael Johnson</div>
                      <div className="text-sm text-gray-600">Psychiatrist</div>
                    </div>
                  </div>
                  <button className="px-3 py-1  text-b text-sm">
                    Subscribe
                  </button>
                </div>
                
                {/* Clinician 3 */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-b rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">EW</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Dr. Emily Wilson</div>
                      <div className="text-sm text-gray-600">Geriatrician</div>
                    </div>
                  </div>
                  <button className="px-3 py-1  text-b text-sm">
                    Subscribe
                  </button>
                </div>
                
                {/* Load more button */}
                <div className="text-left pt-2">
                  <button className="text-b text-sm font-medium hover:underline">
                    Load more
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
