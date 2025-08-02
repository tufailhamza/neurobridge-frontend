'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/login/Header';

export default function CaregiverWelcomePage() {
  const router = useRouter();

  const handleReady = () => {
    // Navigate to the next step in caregiver signup flow
    router.push('/clinician/content-preferences');
  };

  return (
    <div className="min-h-screen bg-d">
      
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            {/* Welcome Row */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <h1 className="text-3xl font-bold text-b">
                Welcome to
              </h1>
              <img 
                src="/logo.png" 
                alt="Neurobridge Logo" 
                className="h-8 w-auto"
              />
            </div>

            {/* Subtitle */}
            <div className="mb-12">
              <h2 className="text-xl text-gray-700 leading-relaxed">
                Let&apos;s build something special together
              </h2>
            </div>

            {/* Ready Button */}
            <button
              onClick={handleReady}
              className="w-full bg-a hover:bg-a-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg"
            >
                              I&apos;m Ready
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 