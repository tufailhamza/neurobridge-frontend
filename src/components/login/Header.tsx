'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function Header({ showBackButton = true, onBackClick }: HeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex justify-between items-center p-6">
      {showBackButton ? (
        <button
          onClick={handleBackClick}
          className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          ← Back
        </button>
      ) : (
        <div></div> // Empty div to maintain spacing when back button is hidden
      )}
      <img 
        src="/logo.png" 
        alt="Neurobridge Logo" 
        className="h-4 w-auto"
      />
    </div>
  );
} 