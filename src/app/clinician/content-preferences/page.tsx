'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/login/Header';
import TopicPills from '@/components/login/caregiver/TopicPills';
import { ContentPreferences } from '@/data/config';
import { preferencesApi } from '@/services/preferences';

export default function ContentPreferencesPage() {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
    // Clear any previous messages when user makes changes
    setError(null);
    setSuccessMessage(null);
  };

  const handleContinue = async () => {
    if (selectedTopics.length === 0) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Get user info from localStorage
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) {
        throw new Error('User information not found. Please log in again.');
      }

      const user = JSON.parse(userInfo);
      
      // Call the API to update content preferences
      await preferencesApi.updateContentPreferences(
        user.user_id,
        'clinician',
        selectedTopics
      );

      setSuccessMessage('Content preferences saved successfully!');
      
      // Navigate to home page after a short delay to show success message
      setTimeout(() => {
        router.push('/clinician/home');
      }, 1500);

    } catch (err) {
      console.error('Error saving content preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to save content preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleContinue}
                disabled={selectedTopics.length === 0 || isSaving}
                className={`px-6 py-3 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selectedTopics.length > 0 && !isSaving
                    ? 'bg-a hover:bg-a-hover text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => router.push('/clinician/home')}
                disabled={isSaving}
                className="px-8 pr-16 py-3 font-semibold text-b hover:text-a-hover transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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