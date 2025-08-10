'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ClinicianSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('home');

  // Update active item based on current pathname
  useEffect(() => {
    // Extract the relevant part of the path for highlighting
    const pathParts = pathname.split('/');
    
    // Check if we're on a specific route that should highlight a menu item
    if (pathParts.includes('profile')) {
      setActiveItem('profile');
    } else if (pathParts.includes('library')) {
      setActiveItem('library');
    } else if (pathParts.includes('subscribed')) {
      setActiveItem('subscribed');
    } else if (pathParts.includes('messages')) {
      setActiveItem('messages');
    } else if (pathParts.includes('purchased')) {
      setActiveItem('purchased');
    } else if (pathParts.includes('settings')) {
      setActiveItem('settings');
    } else if (pathParts.includes('home') || pathname === '/clinician' || pathname === '/clinician/') {
      setActiveItem('home');
    } else {
      // For other routes like content, content-preferences, etc., default to home
      setActiveItem('home');
    }
  }, [pathname]);

  const menuItems = [
    { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'library', label: 'Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'subscribed', label: 'Subscribed', icon: 'M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2zM10 7h10V5H10v2zM10 11h10V9H10v2zM10 15h10v-2H10v2zM10 19h10v-2H10v2z' },
    { id: 'messages', label: 'Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'purchased', label: 'Purchased', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    
    // Navigation logic
    switch (itemId) {
      case 'home':
        router.push('/clinician/home');
        break;        
      case 'library':
        router.push('/clinician/library');
        break;
      case 'subscribed':
        router.push('/clinician/subscribed');
        break;
      case 'messages':
        router.push('/clinician/messages');
        break;
      case 'purchased':
        router.push('/clinician/purchased');
        break;
      case 'profile':
        router.push('/clinician/profile');
        break;        
      case 'settings':
        router.push('/clinician/settings');
        break;        
      default:
        router.push('/clinician/home');
    }
  };

  return (
    <div className="h-screen bg-d  fixed left-0 top-0 w-64 overflow-y-auto">
      <div className=" m-4 border-3 rounded-2xl">
      {/* Logo Section */}
      <div className="p-6">
        <img 
          src="/logo.png" 
          alt="Neurobridge Logo" 
          className="w-64 h-auto"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeItem === item.id
                  ? 'bg-b text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-b'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      </div>
    </div>
  );
} 