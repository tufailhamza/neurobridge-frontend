'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/login/Header';
import TopicPills from '@/components/login/caregiver/TopicPills';
import { ContentPreferences } from '@/data/config';

export default function ContentPreferencesPage() {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleContinue = () => {
    // Handle continue logic here
    console.log('Selected topics:', selectedTopics);
    // Navigate to next step
    router.push('/caregiver/home');
  };

  return (
    <div className="min-h-screen bg-d">
      
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-4xl w-full space-y-8 p-8">
          <div className="">
            {/* Title */}
            <div className="text-left mb-8">
              <h1 className="text-3xl font-bold text-b">
                Content Preferences
              </h1>
            </div>

            {/* Subtitle */}
            <div className="mb-8">
              <p className="text-lg text-gray-700">
                Select all your topics of interest to better curate your experience on the site
              </p>
            </div>

            {/* Topic Pills */}
            <div className="mb-8">
              <TopicPills
                topics={ContentPreferences}
                selectedTopics={selectedTopics}
                onTopicToggle={handleTopicToggle}
              />
            </div>

            {/* Continue Button */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleContinue}
                disabled={selectedTopics.length === 0}
                className={`px-6 py-3 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selectedTopics.length > 0
                    ? 'bg-a hover:bg-a-hover text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save
              </button>
              <button
                onClick={() => router.push('/caregiver/home')}
                className="px-8 pr-16 py-3 font-semibold text-b hover:text-a-hover transition-colors duration-200 focus:outline-none"
              >
                Skip →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 