'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CaregiverSidebar from '../sidebar';
import { Clinician } from '@/types/Clinician';
import { clinicianTypes, specializations } from '@/data/config';
import { env } from '@/config/env';

export default function SubscribedPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'subscribed' | 'discover'>('subscribed');
  const [searchQuery, setSearchQuery] = useState('');
  const [subscribedClinicians, setSubscribedClinicians] = useState<Clinician[]>([]);
  const [discoverCliniciansList, setDiscoverCliniciansList] = useState<Clinician[]>([]);
  const [selectedClinicianType, setSelectedClinicianType] = useState<string>('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingClinicians, setSubscribingClinicians] = useState<Set<string>>(new Set());
  const [unsubscribingClinicians, setUnsubscribingClinicians] = useState<Set<string>>(new Set());

  // Handle URL parameter for tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'discover') {
      setActiveTab('discover');
    }
  }, [searchParams]);

  // Fetch subscribed clinicians from backend API
  useEffect(() => {
    const fetchSubscribedClinicians = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user info from localStorage
        const userInfo = localStorage.getItem('user_info');
        if (!userInfo) {
          throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userInfo);
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Fetch subscribed clinicians for the current caregiver
        const response = await fetch(`${env.BACKEND_URL}/clinicians/subscribed/${user.user_id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized. Please log in again.');
          } else if (response.status === 403) {
            throw new Error('Access forbidden. Please check your permissions.');
          } else if (response.status === 404) {
            // No subscribed clinicians found, set empty array
            setSubscribedClinicians([]);
            return;
          } else {
            throw new Error(`Failed to fetch subscribed clinicians: ${response.status}`);
          }
        }

        const data = await response.json();
        setSubscribedClinicians(data || []);
      } catch (err) {
        console.error('Error fetching subscribed clinicians:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subscribed clinicians');
        setSubscribedClinicians([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedClinicians();
  }, []);

  // Fetch discover clinicians from backend API
  useEffect(() => {
    const fetchDiscoverClinicians = async () => {
      try {
        setDiscoverLoading(true);
        // Get user info from localStorage
        const userInfo = localStorage.getItem('user_info');
        if (!userInfo) {
          return;
        }
        
        const user = JSON.parse(userInfo);
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
          return;
        }

        // Fetch discover clinicians (clinicians not yet subscribed)
        const response = await fetch(`${env.BACKEND_URL}/clinicians/unsubscribed/${user.user_id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDiscoverCliniciansList(data || []);
        }
      } catch (err) {
        console.error('Error fetching discover clinicians:', err);
        // Don't set error for discover clinicians as it's not critical
      } finally {
        setDiscoverLoading(false);
      }
    };

    fetchDiscoverClinicians();
  }, []);

  const handleDelete = async (clinicianId: string) => {
    try {
      setUnsubscribingClinicians(prev => new Set(prev).add(clinicianId));
      
      const userInfo = localStorage.getItem('user_info');
      const user = JSON.parse(userInfo || '{}');
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Make API call to unsubscribe
      const response = await fetch(`${env.BACKEND_URL}/clinicians/unsubscribe`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiver_id: user.user_id,
          clinician_id: clinicianId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to unsubscribe: ${response.status}`);
      }

      // Update local state
      setSubscribedClinicians(prev => prev.filter(c => c.user_id !== clinicianId));
      
      // Add back to discover list
      const deletedClinician = subscribedClinicians.find(c => c.user_id === clinicianId);
      if (deletedClinician) {
        setDiscoverCliniciansList(prev => [...prev, { ...deletedClinician, is_subscribed: false }]);
      }
      
    } catch (error) {
      console.error('Error unsubscribing from clinician:', error);
      // You might want to show a toast notification here
    } finally {
      setUnsubscribingClinicians(prev => {
        const newSet = new Set(prev);
        newSet.delete(clinicianId);
        return newSet;
      });
    }
  };

  const handleMessage = (clinicianId: string) => {
    // Navigate to messages page with the selected clinician
    window.location.href = `/caregiver/messages?clinician=${clinicianId}`;
  };

  const handleSubscribe = async (clinicianId: string) => {
    try {
      setSubscribingClinicians(prev => new Set(prev).add(clinicianId));
      
      const userInfo = localStorage.getItem('user_info');
      const user = JSON.parse(userInfo || '{}');
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Make API call to subscribe
      const response = await fetch(`${env.BACKEND_URL}/clinicians/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiver_id: user.user_id,
          clinician_id: clinicianId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to subscribe: ${response.status}`);
      }

      // Update local state
      const clinicianToSubscribe = discoverCliniciansList.find(c => c.user_id === clinicianId);
      if (clinicianToSubscribe) {
        // Add to subscribed list
        setSubscribedClinicians(prev => [...prev, { ...clinicianToSubscribe, is_subscribed: true }]);
        // Remove from discover list
        setDiscoverCliniciansList(prev => prev.filter(c => c.user_id !== clinicianId));
      }
      
    } catch (error) {
      console.error('Error subscribing to clinician:', error);
      // You might want to show a toast notification here
    } finally {
      setSubscribingClinicians(prev => {
        const newSet = new Set(prev);
        newSet.delete(clinicianId);
        return newSet;
      });
    }
  };

  const getCurrentClinicians = () => {
    return activeTab === 'subscribed' ? subscribedClinicians : discoverCliniciansList;
  };

  const filteredClinicians = getCurrentClinicians().filter(clinician => {
    const fullName = `${clinician.first_name || ''} ${clinician.last_name || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    // Search filter
    const matchesSearch = fullName.includes(searchLower) ||
           (clinician.specialty || '').toLowerCase().includes(searchLower) ||
           (clinician.area_of_expertise || '').toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;
    
    // Clinician type filter (only apply if not 'all' and we're on discover tab)
    if (activeTab === 'discover' && selectedClinicianType !== 'all') {
      const clinicianType = clinician.clinician_type || '';
      if (!clinicianType.toLowerCase().includes(selectedClinicianType.toLowerCase())) {
        return false;
      }
    }
    
    // Specialization filter (only apply if not 'all' and we're on discover tab)
    if (activeTab === 'discover' && selectedSpecialization !== 'all') {
      const areaOfExpertise = clinician.area_of_expertise || '';
      if (!areaOfExpertise.toLowerCase().includes(selectedSpecialization.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });

  // Show loading state
  if (loading || (activeTab === 'discover' && discoverLoading)) {
    return (
      <div className="h-screen bg-d">
        <CaregiverSidebar />
        <div className="ml-64 h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-b mb-6">Subscribed</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading clinicians...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-d">
        <CaregiverSidebar />
        <div className="ml-64 h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-b mb-6">Subscribed</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-d">
      {/* Sidebar */}
      <CaregiverSidebar />
      
      {/* Main Content */}
      <div className="ml-64 h-full flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-b mb-6">Subscribed</h1>
          
          {/* Tab Bar */}
          <div className="flex space-x-8 mb-6">
            <button
              onClick={() => setActiveTab('subscribed')}
              className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'subscribed'
                  ? 'border-b text-b'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Subscribed ({subscribedClinicians.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'border-b text-b'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Discover
            </button>
          </div>

          {/* Search and Sort Row */}
          <div className="flex justify-between items-center">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clinicians..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-b w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-b"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {activeTab === 'subscribed' ? (
              /* Sort Button for Subscribed Tab */
              <button className="bg-white border text-b border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <span className="text-gray-700">Sort by:</span>
                <span className="text-b font-medium">Recently Added</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              /* Clinician Type and Specialization Dropdowns for Discover Tab */
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={selectedClinicianType}
                    onChange={(e) => setSelectedClinicianType(e.target.value)}
                    className="bg-white border text-b border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors appearance-none pr-8"
                  >
                    {clinicianTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <div className="relative">
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="bg-white border text-b border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors appearance-none pr-8"
                  >
                    {specializations.map((spec) => (
                      <option key={spec.value} value={spec.value}>
                        {spec.label}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clinicians List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredClinicians.map((clinician) => (
              <div
                key={clinician.user_id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                {/* Left Side - Profile and Info */}
                <div className="flex items-center space-x-4">
                  {/* Profile Icon */}
                  <div className="w-12 h-12 rounded-full bg-b flex items-center justify-center text-white font-bold text-lg">
                    {(clinician.first_name?.charAt(0) || '')}{(clinician.last_name?.charAt(0) || '') || '?'}
                  </div>
                  
                  {/* Clinician Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {clinician.prefix || ''} {clinician.first_name || ''} {clinician.last_name || ''}
                    </h3>
                    <p className="text-gray-600 text-sm">{clinician.specialty || 'No specialty'}</p>
                    <p className="text-gray-500 text-xs">{clinician.area_of_expertise || 'No expertise area'}</p>
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center space-x-3">
                  {activeTab === 'subscribed' ? (
                    <>
                      {/* Message Button */}
                      <button
                        onClick={() => handleMessage(clinician.user_id)}
                        className="text-b border-2 border-b px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Message</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(clinician.user_id)}
                        disabled={unsubscribingClinicians.has(clinician.user_id)}
                        className={`text-b p-2 rounded-lg transition-colors ${
                          unsubscribingClinicians.has(clinician.user_id)
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {unsubscribingClinicians.has(clinician.user_id) ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-b"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </>
                  ) : (
                    /* Subscribe Button for Discover Tab */
                    <button
                      onClick={() => handleSubscribe(clinician.user_id)}
                      disabled={subscribingClinicians.has(clinician.user_id)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        subscribingClinicians.has(clinician.user_id)
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-b text-white hover:bg-opacity-90'
                      }`}
                    >
                      {subscribingClinicians.has(clinician.user_id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                      <span>{subscribingClinicians.has(clinician.user_id) ? 'Subscribing...' : 'Subscribe'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredClinicians.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No clinicians found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 