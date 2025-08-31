'use client';

import { useState, useEffect } from 'react';
import TopicPills from './login/caregiver/TopicPills';
import { ContentPreferences } from '@/data/config';

interface ContentPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: string[];
  onSave: (preferences: string[]) => void;
}

export default function ContentPreferencesModal({ 
  isOpen, 
  onClose, 
  currentPreferences, 
  onSave 
}: ContentPreferencesModalProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(currentPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Update selectedTopics when currentPreferences prop changes
  useEffect(() => {
    setSelectedTopics(currentPreferences);
  }, [currentPreferences]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSave = async () => {
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await onSave(selectedTopics);
      setSuccessMessage('Content preferences saved successfully!');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError('Failed to save content preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-b">Content Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Subtitle */}
          <div className="mb-6">
            <p className="text-lg text-gray-700">
              Select all your topics of interest to better curate your experience on the site
            </p>
          </div>

          {/* Topic Pills */}
          <div className="mb-6">
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

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSave}
              disabled={selectedTopics.length === 0 || isSaving}
              className={`px-6 py-3 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                selectedTopics.length > 0 && !isSaving
                  ? 'bg-a hover:bg-opacity-90 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-8 py-3 font-semibold text-b hover:text-a-hover transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 