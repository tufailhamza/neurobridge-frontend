'use client';

import { useState, useEffect } from 'react';
import TopicPills from '@/components/login/caregiver/TopicPills';

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
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const topics = [
    'Speech and Language',
    'Functional Communication',
    'Behaviour Support',
    'Fine Motor Skills',
    'Sensory and Self Regulation',
    'Gross Motor Skills',
    'Skill Acquisition',
    'Positive Behaviour Support',
    'Toileting',
    'Communication Tools and Alternatives (PECS, AAC)',
    'Feeding and Eating Support',
    'Activities of Daily Living',
    'Planning and Moving (Motor Planning)',
    'Walking, Balance and Moving Safely'
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedPreferences(currentPreferences);
    }
  }, [isOpen, currentPreferences]);

  const handlePreferenceToggle = (topic: string) => {
    setSelectedPreferences(prev => 
      prev.includes(topic) 
        ? prev.filter(p => p !== topic)
        : [...prev, topic]
    );
  };

  const handleSave = () => {
    onSave(selectedPreferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Content Preferences</h2>
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
          <p className="text-gray-600 mb-6">
            Select all your topics of interest to better curate your experience on the site
          </p>

          {/* Topics Grid */}
          <div className="mb-8">
              <TopicPills
                topics={topics}
                selectedTopics={selectedPreferences}
                onTopicToggle={handlePreferenceToggle}
              />
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="bg-b text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 