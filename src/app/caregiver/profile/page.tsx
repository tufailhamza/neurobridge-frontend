'use client';

import { useState, useEffect } from 'react';
import CaregiverSidebar from '../sidebar';
import EditProfileModal from '@/components/EditProfileModal';
import EditBioModal from '@/components/EditBioModal';
import ImageUpload from '@/components/ImageUpload';
import ContentPreferences from '@/components/ContentPreferences';
import ContentPreferencesModal from '@/components/ContentPreferencesModal';
import { Caregiver } from '@/types/Caregiver';

export default function CaregiverProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isContentPreferencesModalOpen, setIsContentPreferencesModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  const [caregiverData, setCaregiverData] = useState<Caregiver | null>(null);

  // Get caregiver data from localStorage or create default
  const getCaregiverData = (): Caregiver => {
    if (typeof window === 'undefined') {
      return getDefaultCaregiverData();
    }

    // First check if we have existing profile data
    const existingProfile = localStorage.getItem('caregiver_profile');
    if (existingProfile) {
      try {
        return JSON.parse(existingProfile);
      } catch (e) {
        console.error('Error parsing existing profile:', e);
      }
    }

    // Try to get from signup localStorage data
    const userInfo = localStorage.getItem('user_info');
    const signupGeneral = localStorage.getItem('signup_general');
    const signupPersonal = localStorage.getItem('signup_personal');
    
    if (userInfo && signupGeneral) {
      const user = JSON.parse(userInfo);
      const general = JSON.parse(signupGeneral);
      const personal = signupPersonal ? JSON.parse(signupPersonal) : {};
      
      return {
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
    }
    
    return getDefaultCaregiverData();
  };

  const getDefaultCaregiverData = (): Caregiver => {
    return {
      firstName: 'Caregiver',
      lastName: 'User',
      username: 'caregiver',
      country: 'United States',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      caregiverRole: 'Parent',
      childsAge: 0,
      diagnosis: 'Not specified',
      yearsOfDiagnosis: 0,
      makeNamePublic: true,
      makePersonalDetailsPublic: false,
      profileImage: null,
      coverImage: null,
      contentPreferencesTags: ['Autism', 'ADHD', 'Parenting Tips'],
      bio: 'Tell us about yourself...',
      subscribedCliniciansIds: [],
      purchasedFeedContentIds: []
    };
  };

  useEffect(() => {
    const data = getCaregiverData();
    setCaregiverData(data);
    setContentPreferences(data.contentPreferencesTags);
    
    // Load existing images if they exist
    if (data.profileImage) {
      setProfileImage(data.profileImage);
    }
    if (data.coverImage) {
      setCoverImage(data.coverImage);
    }
  }, []);

  const handleSave = (updatedData: Partial<Caregiver>) => {
    if (caregiverData) {
      const newData = { ...caregiverData, ...updatedData };
      setCaregiverData(newData);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('caregiver_profile', JSON.stringify(newData));
      }
      
      console.log('Saving profile data:', updatedData);
    }
  };

  const handleBioSave = (newBio: string) => {
    if (caregiverData) {
      const newData = { ...caregiverData, bio: newBio };
      setCaregiverData(newData);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('caregiver_profile', JSON.stringify(newData));
      }
      
      console.log('Saving bio:', newBio);
    }
  };

  const handleProfileImageChange = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
    
    if (caregiverData) {
      const newData = { ...caregiverData, profileImage: imageUrl };
      setCaregiverData(newData);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('caregiver_profile', JSON.stringify(newData));
      }
    }
    
    console.log('Uploading profile image:', file);
  };

  const handleCoverImageChange = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setCoverImage(imageUrl);
    
    if (caregiverData) {
      const newData = { ...caregiverData, coverImage: imageUrl };
      setCaregiverData(newData);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('caregiver_profile', JSON.stringify(newData));
      }
    }
    
    console.log('Uploading cover image:', file);
  };

  const handleContentPreferencesEdit = () => {
    setIsContentPreferencesModalOpen(true);
  };

  const handleContentPreferencesSave = (newPreferences: string[]) => {
    setContentPreferences(newPreferences);
    
    if (caregiverData) {
      const newData = { ...caregiverData, contentPreferencesTags: newPreferences };
      setCaregiverData(newData);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('caregiver_profile', JSON.stringify(newData));
      }
    }
    
    console.log('Saving content preferences:', newPreferences);
  };

  if (!caregiverData) {
    return <div>Loading...</div>;
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
                    {caregiverData.firstName.charAt(0)}{caregiverData.lastName.charAt(0)}
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
                  <h1 className="text-3xl font-bold text-b">{caregiverData.firstName} {caregiverData.lastName}</h1>
                  <p className="text-gray-600 text-lg">@{caregiverData.username}</p>
                  <p className="text-gray-500">{caregiverData.city}, {caregiverData.state}</p>
                  {caregiverData.caregiverRole && (
                    <p className="text-gray-500 text-sm mt-1">Role: {caregiverData.caregiverRole}</p>
                  )}
                  {caregiverData.childsAge > 0 && (
                    <p className="text-gray-500 text-sm">Child's Age: {caregiverData.childsAge} years</p>
                  )}
                  {caregiverData.diagnosis && caregiverData.diagnosis !== 'Not specified' && (
                    <p className="text-gray-500 text-sm">Diagnosis: {caregiverData.diagnosis}</p>
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