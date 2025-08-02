'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageFile: File) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function ImageUpload({ currentImage, onImageChange, className = "", children }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`cursor-pointer hover:cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {children}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
} 