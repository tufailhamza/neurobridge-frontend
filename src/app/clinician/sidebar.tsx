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
    if (pathParts.includes('ariadne')) {
      setActiveItem('ariadne');
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
    { id: 'ariadne', label: 'Ariadne', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
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
      case 'ariadne':
        router.push('/clinician/ariadne');
        break;
      case 'purchased':
        router.push('/clinician/purchased');
        break;
      case 'settings':
        router.push('/clinician/settings');
        break;        
      default:
        router.push('/clinician/home');
    }
  };

  // Mock user data - in real app, get from context or localStorage
  const userInfo = {
    firstName: 'John',
    lastName: 'Doe',
    profileImage: null // Set to null to show initials
  };

  const handleProfileClick = () => {
    router.push('/clinician/profile');
  };

      return (
        
      <div className="h-screen fixed left-0 top-0 w-64 overflow-y-auto">
        <div className="m-4 bg-[#FEFEFE] border border-[#D4D7E3] rounded-lg">
        <div className="h-2"></div>
        {/* Logo Section */}
        <div className="p-6">
          <img 
            src="/logo.png" 
            alt="Neurobridge Logo" 
            className="w-64 h-auto"
          />
        </div>

        {/* Navigation Menu */}
        <nav className="p-3">
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
                {item.id === 'home' ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                ) : item.id === 'library' ? (
                  <img 
                    src="/library-icon.svg" 
                    alt="Library" 
                    className={`h-6 w-6 ${activeItem === item.id ? 'brightness-0 invert' : ''}`}
                  />
                ) : item.id === 'subscribed' ? (
                  <img 
                    src="/subscribed-icon.svg" 
                    alt="Subscribed" 
                    className={`h-6 w-6 ${activeItem === item.id ? 'brightness-0 invert' : ''}`}
                  />
                ) : item.id === 'messages' ? (
                  <img 
                    src="/Messages-icon.svg" 
                    alt="Messages" 
                    className={`h-6 w-6 ${activeItem === item.id ? 'brightness-0 invert' : ''}`}
                  />
                ) : item.id === 'purchased' ? (
                  <img 
                    src="/Purchased-icon.svg" 
                    alt="Purchased" 
                    className={`h-6 w-6 ${activeItem === item.id ? 'brightness-0 invert' : ''}`}
                  />
                ) : item.id === 'ariadne' ? (
                  <img 
                    src="/ariadne-icon.svg" 
                    alt="Ariadne" 
                    className={`h-6 w-6 ${activeItem === item.id ? 'brightness-0 invert' : ''}`}
                  />
                ) : item.id === 'settings' ? (
                  <img 
                    src="/setting-icon.svg" 
                    alt="Settings" 
                    className={`h-6 w-6 ${activeItem === item.id ? 'brightness-0 invert' : ''}`}
                  />
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                )}
                <span className={`font-normal flex items-center ${activeItem === item.id ? 'text-white' : 'text-[#010101]'}`}>{item.label}</span>
              </button>
            ))}
            
            {/* Profile Picture - positioned right below Settings */}
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center justify-start px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors mt-2"
            >
              {userInfo.profileImage ? (
                <img
                  src={userInfo.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-b flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {userInfo.firstName.charAt(0)}{userInfo.lastName.charAt(0)}
                  </span>
                </div>
              )}
            </button>

            {/* Profile Bio Section */}
            {!userInfo.profileImage && (
              <div className="mt-3 flex flex-col items-start p-4 gap-2 bg-[#FEFEFE] border border-[#01B8FA] rounded-lg">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Add a photo and a bio to your profile so others can get to know you.
                </p>
              </div>
            )}
          </div>
        </nav>
        
        {/* Bottom spacing */}
        <div className="h-2"></div>
      </div>
    </div>
  );
} 


