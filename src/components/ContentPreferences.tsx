'use client';

import { useState } from 'react';

interface ContentPreferencesProps {
  preferences: string[];
  onEdit?: () => void;
}

export default function ContentPreferences({ preferences, onEdit }: ContentPreferencesProps) {
  return (
    <div className="bg-white rounded-lg border-2  p-6">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Content Preferences</h2>
        <button 
          onClick={onEdit}
          className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {preferences && preferences.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {preferences.map((preference, index) => (
            <span 
              key={index}
              className=" text-b border-2 border-gray-400 px-3 py-1 rounded-md text-sm font-medium"
            >
              {preference}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">
          This is private to you and helps curate the content you see
        </div>
      )}
    </div>
  );
} 