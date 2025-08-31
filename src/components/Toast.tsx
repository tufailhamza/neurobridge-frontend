'use client';

import { Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  subtitle?: string;
  contactEmail?: string;
  type?: 'error' | 'info' | 'success' | 'warning';
  duration?: number;
  onClose?: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  subtitle,
  contactEmail,
  type = 'error',
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`max-w-md ${isExiting ? 'toast-exit' : 'animate-in'}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-b">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-a" />
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-2">
          <p className="text-sm text-gray-700">{message}</p>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
          {contactEmail && (
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-1">If this persists reach out to:</p>
              <a 
                href={`mailto:${contactEmail}`}
                className="text-xs text-a hover:text-a-hover transition-colors"
              >
                {contactEmail}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
