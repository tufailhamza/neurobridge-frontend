'use client';

import { useState, useRef } from 'react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string | null;
  onSave: (file: File | null) => void;
  firstName: string;
  lastName: string;
}

const ProfilePhotoModal = ({ isOpen, onClose, currentImage, onSave, firstName, lastName }: ProfilePhotoModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDelete = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSave = () => {
    onSave(selectedFile);
    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg  max-w-md w-full mx-4">
        {/* Header Row - Title and cross */}
        <div className="flex justify-between items-center p-6  ">
          <h2 className="text-lg font-semibold text-b">Profile Photo</h2>
          <button
            onClick={onClose}
            className="text-gray-900 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Circular Profile Photo in Center */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white  bg-b flex items-center justify-center text-white text-3xl font-bold">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Upload Photo Text */}
          <div className="text-center mb-6">
            <button
              onClick={handleUploadClick}
              className="text-a text-sm font-medium hover:underline cursor-pointer"
            >
              Upload photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Bottom Row - Delete and Save */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleDelete}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm">Delete</span>
            </button>
            <button
              onClick={handleSave}
              className="bg-a text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoModal;
