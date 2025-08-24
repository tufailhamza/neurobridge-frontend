'use client';

import { useState, useEffect } from 'react';
import ClinicianSidebar from '../sidebar';
import EditClinicianProfileModal from '@/components/EditClinicianProfileModal';
import EditBioModal from '@/components/EditBioModal';
import ImageUpload from '@/components/ImageUpload';
import ContentPreferences from '@/components/ContentPreferences';
import ContentPreferencesModal from '@/components/ContentPreferencesModal';
import { env } from '@/config/env';



interface ClinicianProfile {
  user_id: number;
  email: string;
  role: string;
  account_create_date: string;
  last_active_at: string | null;
  last_engagement_at: string | null;
  created_at: string;
  updated_at: string;
  stripe_customer_id: string | null;
  profile_type: string;
  specialty: string;
  profile_image: string | null;
  is_subscribed: boolean;
  prefix: string;
  first_name: string;
  last_name: string;
  country: string;
  city: string;
  state: string;
  zip_code: string;
  clinician_type: string;
  license_number: string;
  area_of_expertise: string;
  content_preferences_tags: string[];
}

// Helper function to convert ClinicianProfile to Caregiver format for the modal
const convertToCaregiverFormat = (clinician: ClinicianProfile) => {
  return {
    firstName: clinician.first_name,
    lastName: clinician.last_name,
    username: clinician.email,
    country: clinician.country,
    city: clinician.city,
    state: clinician.state,
    zipCode: clinician.zip_code,
    caregiverRole: clinician.clinician_type,
    childsAge: 0,
    diagnosis: clinician.specialty,
    yearsOfDiagnosis: 0,
    makeNamePublic: true,
    makePersonalDetailsPublic: true,
    profileImage: clinician.profile_image,
    coverImage: null,
    contentPreferencesTags: clinician.content_preferences_tags || [],
    bio: clinician.area_of_expertise || '',
    subscribedCliniciansIds: [],
    purchasedFeedContentIds: []
  };
};

export default function ClinicianProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isContentPreferencesModalOpen, setIsContentPreferencesModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  const [clinicianData, setClinicianData] = useState<ClinicianProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = localStorage.getItem('user_info');
        const userId = JSON.parse(userInfo || '{}').user_id;
        if (!userId) {
          console.error('No user ID found in localStorage');
          setLoading(false);
          return;
        }

        const accessToken = localStorage.getItem('access_token');
        
        const response = await fetch(`${env.BACKEND_URL}/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setClinicianData(data);
          setProfileImage(data.profile_image);
          setContentPreferences(data.content_preferences_tags || []);
        } else {
          // Check if response is JSON before trying to parse it
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('Failed to fetch profile:', errorData.detail || `Status: ${response.status}`);
          } else {
            // Handle HTML error responses
            const errorText = await response.text();
            console.error('Non-JSON error response:', errorText);
            console.error('Failed to fetch profile:', `${response.status} ${response.statusText}`);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = (updatedData: any) => {
    // Here you would typically save to backend
    console.log('Saving profile data:', updatedData);
  };

  const handleBioSave = (newBio: string) => {
    // Here you would typically save to backend
    console.log('Saving bio:', newBio);
  };

  const handleProfileImageChange = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
    // Here you would typically upload to backend
    console.log('Uploading profile image:', file);
  };

  const handleCoverImageChange = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setCoverImage(imageUrl);
    // Here you would typically upload to backend
    console.log('Uploading cover image:', file);
  };

  const handleContentPreferencesEdit = () => {
    setIsContentPreferencesModalOpen(true);
  };

  const handleContentPreferencesSave = (newPreferences: string[]) => {
    setContentPreferences(newPreferences);
    // Here you would typically save to backend
    console.log('Saving content preferences:', newPreferences);
  };

  if (loading) {
    return (
      <div className="h-screen bg-d">
        <ClinicianSidebar />
        <div className="ml-64 h-full flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!clinicianData) {
    return (
      <div className="h-screen bg-d">
        <ClinicianSidebar />
        <div className="ml-64 h-full flex items-center justify-center">
          <div className="text-xl">Failed to load profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-d">
      {/* Sidebar */}
      <ClinicianSidebar />
      
      {/* Main Content */}
      <div className="ml-64  flex bg-d ">
        
        {/* Column B - Main Content */}
        <div className="w-4/5 p-6 bg-d">
          <div className="bg-white overflow-hidden">
            
            {/* Cover Image Section */}
            <div className="relative h-64">
              {/* Cover Image */}
              {coverImage ? (
                <img 
                  src={coverImage} 
                  alt="Cover" 
                  className="w-full h-full object-cover rounded-t-xl"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 rounded-t-xl"></div>
              )}
              
              {/* Edit Icon for Cover */}
              <ImageUpload
                currentImage={coverImage}
                onImageChange={handleCoverImageChange}
                className="absolute top-4 right-4 z-10"
              >
                <button className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all border border-gray-200 cursor-pointer">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </ImageUpload>
                
              {/* Profile Icon - Overlapping */}
              <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                <div className="relative">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const nextSibling = target.nextElementSibling as HTMLElement;
                        if (nextSibling) {
                          nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-32 h-32 rounded-full border-4 border-white shadow-lg bg-b flex items-center justify-center text-white text-3xl font-bold ${profileImage ? 'hidden' : 'flex'}`}
                  >
                    {clinicianData.first_name.charAt(0)}{clinicianData.last_name.charAt(0)}
                  </div>
                  
                  {/* Edit Icon for Profile */}
                  <ImageUpload
                    currentImage={profileImage}
                    onImageChange={handleProfileImageChange}
                    className="absolute -top-1 -right-1 z-10"
                  >
                    <button className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all border border-gray-200 cursor-pointer">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </ImageUpload>
                </div>
              </div>
            </div>
            
            {/* Profile Information */}
            <div className="pt-20 px-8 pb-8">
              {/* Name and Edit Row */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-b">{clinicianData.prefix} {clinicianData.first_name} {clinicianData.last_name}</h1>
                  <p className="text-gray-600 text-lg">{clinicianData.email}</p>
                  <p className="text-gray-500">{clinicianData.city}, {clinicianData.state}</p>
                  <p className="text-gray-500">{clinicianData.clinician_type} - {clinicianData.specialty}</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              
              {/* Bio Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-b">Bio</h2>
                  <button 
                    onClick={() => setIsBioModalOpen(true)}
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg ">
                  <p className="text-black">
                    {clinicianData.area_of_expertise || "Tell us about your expertise..."}
                  </p>
                </div>
              </div>

              {/* Approach Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-b">My Approach</h2>
                  <button 
                    onClick={() => setIsBioModalOpen(true)}
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg ">
                  <p className="text-black">
                    {"Tell us about your approach..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column C - Content Preferences */}
        <div className="w-128 p-6">
          <div className="sticky top-6">
            <div className="space-y-6">
              {/* Profile Link Section */}
              <div className="space-y-3 p-4 border-2 border-gray-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Profile Link</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="https://neurobridge.com/profile/your-name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                />
              </div>

              {/* Allow Messages Section */}
              <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                <span className="text-sm font-semibold text-gray-900">Allow Messages</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-b focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                </button>
              </div>

              {/* Areas of Expertise Section */}
              <div className="space-y-3 p-4 border-2 border-gray-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Areas of Expertise</span>
                  <svg className="w-4 h-4 text-gray-400 cursor-pointer hover:text-b transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-500">
                  {clinicianData.area_of_expertise || "Click edit to manage your areas of expertise"}
                </div>
              </div>

              {/* Languages Spoken Section */}
              <div className="space-y-3 p-4 border-2 border-gray-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Languages Spoken</span>
                  <svg className="w-4 h-4 text-gray-400 cursor-pointer hover:text-b transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-500">
                  Click edit to manage languages you speak
                </div>
              </div>

              {/* Content Preferences Section */}
              <div className="space-y-3 p-4 border-2 border-gray-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Content Preferences</span>
                  <svg className="w-4 h-4 text-gray-400 cursor-pointer hover:text-b transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-500">
                  This is private to you and helps curate the content you see
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <EditClinicianProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clinician={clinicianData}
        onSave={handleSave}
      />

      {/* Bio Edit Modal */}
      <EditBioModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        currentBio={clinicianData.area_of_expertise}
        onSave={handleBioSave}
      />

      {/* Content Preferences Modal */}
      <ContentPreferencesModal
        isOpen={isContentPreferencesModalOpen}
        onClose={() => setIsContentPreferencesModalOpen(false)}
        currentPreferences={contentPreferences}
        onSave={handleContentPreferencesSave}
      />
    </div>
  );
} 