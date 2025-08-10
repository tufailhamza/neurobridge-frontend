'use client';

import { useState, useEffect } from 'react';
import CaregiverSidebar from '../sidebar';
import { Clinician } from '@/types/Clinician';
import { clinicianTypes, specializations } from '@/data/config';
import { env } from '@/config/env';

// API response type to match the endpoint
interface APIClinician {
  user_id: string;
  specialty: string;
  profile_image: string | null;
  is_subscribed: boolean;
  prefix: string | null;
  first_name: string;
  last_name: string;
  country: string;
  city: string;
  state: string;
  zip_code: string;
  clinician_type: string;
  license_number: string;
  area_of_expertise: string;
}

export default function SubscribedPage() {
  const [activeTab, setActiveTab] = useState<'subscribed' | 'discover'>('subscribed');
  const [searchQuery, setSearchQuery] = useState('');
  const [subscribedClinicians, setSubscribedClinicians] = useState<Clinician[]>([]);
  const [discoverCliniciansList, setDiscoverCliniciansList] = useState<Clinician[]>([]);
  const [selectedClinicianType, setSelectedClinicianType] = useState<string>('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Get user's subscribed clinicians from localStorage
  const getUserSubscribedClinicians = (): string[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      // First check if we have existing profile data
      const existingProfile = localStorage.getItem('caregiver_profile');
      if (existingProfile) {
        const profile = JSON.parse(existingProfile);
        return profile.subscribedCliniciansIds || [];
      }
      
      // Fallback to signup data
      const userInfo = localStorage.getItem('user_info');
      const signupGeneral = localStorage.getItem('signup_general');
      const signupPersonal = localStorage.getItem('signup_personal');
      
      if (userInfo && signupGeneral) {
        // Return empty array for new users
        return [];
      }
      
      return [];
    } catch (e) {
      console.error('Error getting user subscribed clinicians:', e);
      return [];
    }
  };

  // Fetch clinicians from API
  useEffect(() => {
    const fetchClinicians = async () => {
      setLoading(true);
      console.log('Fetching clinicians...');
      try {
        const response = await fetch(`${env.BACKEND_URL}/clinicians/clinicians?limit=50`);
        if (!response.ok) {
          throw new Error('Failed to fetch clinicians');
        }
        const apiClinicians: APIClinician[] = await response.json();
        
        // Get user's subscribed clinicians from localStorage
        const userSubscribedIds = getUserSubscribedClinicians();
        console.log('User subscribed clinician IDs:', userSubscribedIds);
        
        // Map API response to Clinician type and determine subscription status
        const mappedClinicians: Clinician[] = apiClinicians.map(apiClinician => ({
          user_id: apiClinician.user_id,
          specialty: apiClinician.specialty,
          profileImage: apiClinician.profile_image,
          isSubscribed: userSubscribedIds.includes(apiClinician.user_id), // Check against localStorage
          prefix: apiClinician.prefix || '',
          firstName: apiClinician.first_name,
          lastName: apiClinician.last_name,
          country: apiClinician.country,
          city: apiClinician.city,
          state: apiClinician.state,
          zipCode: apiClinician.zip_code,
          clinicianType: apiClinician.clinician_type as any, // Type assertion for now
          licenseNumber: apiClinician.license_number,
          areaOfExpertise: apiClinician.area_of_expertise as any, // Type assertion for now
        }));
        
        console.log('Mapped clinicians with subscription status:', mappedClinicians);
        
        // Filter subscribed vs discover clinicians based on localStorage
        const subscribed = mappedClinicians.filter(c => c.isSubscribed);
        const discover = mappedClinicians.filter(c => !c.isSubscribed);
        
        setSubscribedClinicians(subscribed);
        setDiscoverCliniciansList(discover);
      } catch (error) {
        console.error('Error fetching clinicians:', error);
        // Fallback to empty lists if API fails
        setSubscribedClinicians([]);
        setDiscoverCliniciansList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicians();
  }, []);

  const handleDelete = (clinicianId: string) => {
    // Remove from subscribed list
    setSubscribedClinicians(prev => prev.filter(c => c.user_id !== clinicianId));
    
    // Add to discover list
    const clinicianToUnsubscribe = subscribedClinicians.find(c => c.user_id === clinicianId);
    if (clinicianToUnsubscribe) {
      setDiscoverCliniciansList(prev => [...prev, { ...clinicianToUnsubscribe, isSubscribed: false }]);
    }
    
    // Update localStorage
    updateLocalStorageSubscriptions(clinicianId, false);
  };

  const handleMessage = (clinicianId: string) => {
    console.log('Opening message with clinician:', clinicianId);
  };

  const handleSubscribe = (clinicianId: string) => {
    const clinicianToSubscribe = discoverCliniciansList.find(c => c.user_id === clinicianId);
    if (clinicianToSubscribe) {
      // Add to subscribed list
      setSubscribedClinicians(prev => [...prev, { ...clinicianToSubscribe, isSubscribed: true }]);
      // Remove from discover list
      setDiscoverCliniciansList(prev => prev.filter(c => c.user_id !== clinicianId));
      
      // Update localStorage
      updateLocalStorageSubscriptions(clinicianId, true);
    }
  };

  // Update localStorage with subscription changes
  const updateLocalStorageSubscriptions = (clinicianId: string, isSubscribing: boolean) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Get current profile data
      const existingProfile = localStorage.getItem('caregiver_profile');
      let profileData;
      
      if (existingProfile) {
        profileData = JSON.parse(existingProfile);
      } else {
        // Create new profile data if none exists
        const userInfo = localStorage.getItem('user_info');
        const signupGeneral = localStorage.getItem('signup_general');
        const signupPersonal = localStorage.getItem('signup_personal');
        
        if (userInfo && signupGeneral) {
          const user = JSON.parse(userInfo);
          const general = JSON.parse(signupGeneral);
          const personal = signupPersonal ? JSON.parse(signupPersonal) : {};
          
          profileData = {
            firstName: general.firstName || user.name?.split(' ')[0] || '',
            lastName: general.lastName || user.name?.split(' ')[1] || '',
            username: user.email?.split('@')[0] || '',
            country: general.country || '',
            city: general.city || '',
            state: general.state || '',
            zipCode: general.zipCode || '',
            caregiverRole: personal.caregiverRole || '',
            childsAge: personal.childAge ? parseInt(personal.childAge) : 0,
            diagnosis: personal.diagnosis || '',
            yearsOfDiagnosis: personal.yearsOfDiagnosis ? parseInt(personal.yearsOfDiagnosis) : 0,
            makeNamePublic: true,
            makePersonalDetailsPublic: false,
            profileImage: null,
            coverImage: null,
            contentPreferencesTags: ['Autism', 'ADHD', 'Parenting Tips'],
            bio: 'Tell us about yourself...',
            subscribedCliniciansIds: [],
            purchasedFeedContentIds: []
          };
        } else {
          return; // Can't update if no profile data exists
        }
      }
      
      // Update subscribed clinicians list
      if (isSubscribing) {
        if (!profileData.subscribedCliniciansIds.includes(clinicianId)) {
          profileData.subscribedCliniciansIds.push(clinicianId);
        }
      } else {
        profileData.subscribedCliniciansIds = profileData.subscribedCliniciansIds.filter(
          (id: string) => id !== clinicianId
        );
      }
      
      // Save updated profile to localStorage
      localStorage.setItem('caregiver_profile', JSON.stringify(profileData));
      console.log('Updated localStorage subscriptions:', profileData.subscribedCliniciansIds);
      
    } catch (e) {
      console.error('Error updating localStorage subscriptions:', e);
    }
  };

  const getCurrentClinicians = () => {
    return activeTab === 'subscribed' ? subscribedClinicians : discoverCliniciansList;
  };

  const filteredClinicians = getCurrentClinicians().filter(clinician => {
    const fullName = `${clinician.firstName || ''} ${clinician.lastName || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    return fullName.includes(searchLower) ||
           (clinician.specialty || '').toLowerCase().includes(searchLower) ||
           (clinician.areaOfExpertise || '').toLowerCase().includes(searchLower);
  });

  // Filter by clinician type and specialization
  const finalFilteredClinicians = filteredClinicians.filter(clinician => {
    if (selectedClinicianType !== 'all' && clinician.clinicianType !== selectedClinicianType) {
      return false;
    }
    if (selectedSpecialization !== 'all' && clinician.areaOfExpertise !== selectedSpecialization) {
      return false;
    }
    return true;
  });

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
              Discover ({discoverCliniciansList.length})
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading clinicians...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {finalFilteredClinicians.map((clinician) => (
                <div
                  key={clinician.user_id}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  {/* Left Side - Profile and Info */}
                  <div className="flex items-center space-x-4">
                    {/* Profile Icon */}
                    <div className="w-12 h-12 rounded-full bg-b flex items-center justify-center text-white font-bold text-lg">
                      {(clinician.firstName?.charAt(0) || '')}{(clinician.lastName?.charAt(0) || '') || '?'}
                    </div>
                    
                    {/* Clinician Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {clinician.prefix || ''} {clinician.firstName || ''} {clinician.lastName || ''}
                      </h3>
                      <p className="text-gray-600 text-sm">{clinician.specialty || 'No specialty'}</p>
                      <p className="text-gray-500 text-xs">{clinician.areaOfExpertise || 'No expertise area'}</p>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center space-x-3">
                    {activeTab === 'subscribed' ? (
                      <>
                        {/* Message Button */}
                        <button
                          onClick={() => handleMessage(clinician.user_id)}
                          className=" text-b border-2 border-b px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Message</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(clinician.user_id)}
                          className=" text-b p-2 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      /* Subscribe Button for Discover Tab */
                      <button
                        onClick={() => handleSubscribe(clinician.user_id)}
                        className="bg-b text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Subscribe</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && finalFilteredClinicians.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No clinicians found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 