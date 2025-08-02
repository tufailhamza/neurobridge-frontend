'use client';

import { useState } from 'react';

interface EditBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBio: string;
  onSave: (newBio: string) => void;
}

export default function EditBioModal({ isOpen, onClose, currentBio, onSave }: EditBioModalProps) {
  const [bioText, setBioText] = useState(currentBio);
  const maxLength = 1000;

  const handleSave = () => {
    onSave(bioText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Modal Header */}
        <div className="flex justify-between items-center pl-8 pr-4 py-8">
          <h2 className="text-2xl font-semibold text-b">Bio</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-6 text-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about yourself
            </label>
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              maxLength={maxLength}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent resize-none"
              placeholder="Share your story, experiences, and what brings you here..."
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-500">
                {bioText.length}/{maxLength} characters
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6">
          <button
            onClick={handleSave}
            className="bg-a text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 