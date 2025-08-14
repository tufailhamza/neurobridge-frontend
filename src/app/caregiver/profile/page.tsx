'use client';

import { useState, useEffect } from 'react';
import CaregiverSidebar from '../sidebar';
import EditProfileModal from '@/components/EditProfileModal';
import EditBioModal from '@/components/EditBioModal';
import ImageUpload from '@/components/ImageUpload';
import ContentPreferences from '@/components/ContentPreferences';
import ContentPreferencesModal from '@/components/ContentPreferencesModal';

interface CaregiverProfile {
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
  first_name: string;
  last_name: string;
  username: string;
  country: string;
  city: string;
  state: string;
  zip_code: string;
  caregiver_role: string;
  childs_age: number;
  diagnosis: string;
  years_of_diagnosis: number;
  make_name_public: boolean;
  make_personal_details_public: boolean;
  profile_image: string | null;
  cover_image: string | null;
  content_preferences_tags: string[];
  bio: string;
  subscribed_clinicians_ids: string[];
  purchased_feed_content_ids: string[];
}

export default function CaregiverProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isContentPreferencesModalOpen, setIsContentPreferencesModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  const [caregiverData, setCaregiverData] = useState<CaregiverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = localStorage.getItem('user_info');
        const userId = JSON.parse(userInfo || '{}').user_id;
        
        if (!userId) {
          throw new Error('No user ID found in localStorage');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${userId}`, {
          headers: {
            'accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCaregiverData(data);
          setProfileImage(data.profile_image);
          setCoverImage(data.cover_image);
          setContentPreferences(data.content_preferences_tags || []);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch profile');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching the profile';
        setError(errorMessage);
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
      <div className="h-screen bg-d flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-d flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!caregiverData) {
    return (
      <div className="h-screen bg-d flex items-center justify-center">
        <div className="text-xl">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-d">
      {/* Sidebar */}
      <CaregiverSidebar />
      
      {/* Main Content */}
      <div className="ml-64 h-full flex">
        
        {/* Column B - Main Content */}
        <div className="w-4/5 p-6">
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
                    {caregiverData.first_name.charAt(0)}{caregiverData.last_name.charAt(0)}
                  </div>
                  
                  {/* Edit Icon for Profile */}
                  <ImageUpload
                    currentImage={profileImage}
                    onImageChange={handleProfileImageChange}
                    className="absolute -top-1 -right-1 z-10"
                  >
                    <button className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all border border-gray-200 cursor-pointer">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <h1 className="text-3xl font-bold text-b">{caregiverData.first_name} {caregiverData.last_name}</h1>
                  <p className="text-gray-600 text-lg">@{caregiverData.username}</p>
                  <p className="text-gray-500">{caregiverData.city}, {caregiverData.state}</p>
                  {caregiverData.caregiver_role && (
                    <p className="text-gray-500 text-sm mt-1">Role: {caregiverData.caregiver_role}</p>
                  )}
                  {caregiverData.childs_age > 0 && (
                    <p className="text-gray-500 text-sm">Child's Age: {caregiverData.childs_age} years</p>
                  )}
                  {caregiverData.diagnosis && caregiverData.diagnosis !== 'Not specified' && (
                    <p className="text-gray-500 text-sm">Diagnosis: {caregiverData.diagnosis}</p>
                  )}
                  {caregiverData.years_of_diagnosis > 0 && (
                    <p className="text-gray-500 text-sm">Years of Diagnosis: {caregiverData.years_of_diagnosis}</p>
                  )}
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-black">
                    {caregiverData.bio || "Tell us about yourself..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column C - Content Preferences */}
        <div className="w-128 p-6">
          <div className="sticky top-6">
            <ContentPreferences 
              preferences={contentPreferences}
              onEdit={handleContentPreferencesEdit}
            />
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        caregiver={caregiverData}
        onSave={handleSave}
      />

      {/* Bio Edit Modal */}
      <EditBioModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        currentBio={caregiverData.bio}
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