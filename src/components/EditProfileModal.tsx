'use client';

import { useState } from 'react';
import { Caregiver } from '@/types/Caregiver';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiver: Caregiver;
  onSave: (updatedData: Partial<Caregiver>) => void;
}

export default function EditProfileModal({ isOpen, onClose, caregiver, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: caregiver.firstName,
    lastName: caregiver.lastName,
    username: caregiver.username,
    country: caregiver.country,
    city: caregiver.city,
    state: caregiver.state,
    zipCode: caregiver.zipCode,
    caregiverRole: caregiver.caregiverRole,
    childsAge: caregiver.childsAge,
    diagnosis: caregiver.diagnosis,
    yearsOfDiagnosis: caregiver.yearsOfDiagnosis,
    makeNamePublic: caregiver.makeNamePublic,
    makePersonalDetailsPublic: caregiver.makePersonalDetailsPublic
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userInfo = localStorage.getItem('user_info');
      const userId = JSON.parse(userInfo || '{}').user_id;
      
      if (!userId) {
        throw new Error('No user ID found in localStorage');
      }

      // Convert form data to backend format (snake_case)
      const backendData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        country: formData.country,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        caregiver_role: formData.caregiverRole,
        childs_age: formData.childsAge,
        diagnosis: formData.diagnosis,
        years_of_diagnosis: formData.yearsOfDiagnosis,
        make_name_public: formData.makeNamePublic,
        make_personal_details_public: formData.makePersonalDetailsPublic
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(backendData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('Profile updated successfully:', result);
      
      // Call the onSave callback with the updated data
      onSave(formData);
      onClose();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Modal Header */}
        <div className="flex justify-between items-center pl-8 pr-4 py-8">
          <h2 className="text-2xl font-semibold text-b">Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-6 text-gray-800">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* General Information Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-500">General Information</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Make name public</span>
                <button 
                  onClick={() => handleInputChange('makeNamePublic', !formData.makeNamePublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.makeNamePublic ? 'bg-b' : 'bg-gray-200'
                  }`}
                  disabled={isLoading}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.makeNamePublic ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter first name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter last name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                placeholder="Enter username"
                disabled={isLoading}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Select country</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Italy">Italy</option>
                <option value="Spain">Spain</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Belgium">Belgium</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Austria">Austria</option>
                <option value="Sweden">Sweden</option>
                <option value="Norway">Norway</option>
                <option value="Denmark">Denmark</option>
                <option value="Finland">Finland</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Japan">Japan</option>
                <option value="South Korea">South Korea</option>
                <option value="Singapore">Singapore</option>
                <option value="India">India</option>
                <option value="Brazil">Brazil</option>
                <option value="Mexico">Mexico</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="South Africa">South Africa</option>
                <option value="Egypt">Egypt</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="Morocco">Morocco</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter city"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select state</option>
                  <option value="Alabama">Alabama</option>
                  <option value="Alaska">Alaska</option>
                  <option value="Arizona">Arizona</option>
                  <option value="Arkansas">Arkansas</option>
                  <option value="California">California</option>
                  <option value="Colorado">Colorado</option>
                  <option value="Connecticut">Connecticut</option>
                  <option value="Delaware">Delaware</option>
                  <option value="Florida">Florida</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Hawaii">Hawaii</option>
                  <option value="Idaho">Idaho</option>
                  <option value="Illinois">Illinois</option>
                  <option value="Indiana">Indiana</option>
                  <option value="Iowa">Iowa</option>
                  <option value="Kansas">Kansas</option>
                  <option value="Kentucky">Kentucky</option>
                  <option value="Louisiana">Louisiana</option>
                  <option value="Maine">Maine</option>
                  <option value="Maryland">Maryland</option>
                  <option value="Massachusetts">Massachusetts</option>
                  <option value="Michigan">Michigan</option>
                  <option value="Minnesota">Minnesota</option>
                  <option value="Mississippi">Mississippi</option>
                  <option value="Missouri">Missouri</option>
                  <option value="Montana">Montana</option>
                  <option value="Nebraska">Nebraska</option>
                  <option value="Nevada">Nevada</option>
                  <option value="New Hampshire">New Hampshire</option>
                  <option value="New Jersey">New Jersey</option>
                  <option value="New Mexico">New Mexico</option>
                  <option value="New York">New York</option>
                  <option value="North Carolina">North Carolina</option>
                  <option value="North Dakota">North Dakota</option>
                  <option value="Ohio">Ohio</option>
                  <option value="Oklahoma">Oklahoma</option>
                  <option value="Oregon">Oregon</option>
                  <option value="Pennsylvania">Pennsylvania</option>
                  <option value="Rhode Island">Rhode Island</option>
                  <option value="South Carolina">South Carolina</option>
                  <option value="South Dakota">South Dakota</option>
                  <option value="Tennessee">Tennessee</option>
                  <option value="Texas">Texas</option>
                  <option value="Utah">Utah</option>
                  <option value="Vermont">Vermont</option>
                  <option value="Virginia">Virginia</option>
                  <option value="Washington">Washington</option>
                  <option value="West Virginia">West Virginia</option>
                  <option value="Wisconsin">Wisconsin</option>
                  <option value="Wyoming">Wyoming</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter zip code"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Details</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Make public</span>
                <button 
                  onClick={() => handleInputChange('makePersonalDetailsPublic', !formData.makePersonalDetailsPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.makePersonalDetailsPublic ? 'bg-b' : 'bg-gray-200'
                  }`}
                  disabled={isLoading}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.makePersonalDetailsPublic ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caregiver Role</label>
                <select
                  value={formData.caregiverRole}
                  onChange={(e) => handleInputChange('caregiverRole', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select caregiver role</option>
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Foster Parent">Foster Parent</option>
                  <option value="Adoptive Parent">Adoptive Parent</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Aunt/Uncle">Aunt/Uncle</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                  <option value="Step Parent">Step Parent</option>
                  <option value="Other Family Member">Other Family Member</option>
                  <option value="Family Friend">Family Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child's Age</label>
                <input
                  type="number"
                  value={formData.childsAge}
                  onChange={(e) => handleInputChange('childsAge', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter age"
                  min="0"
                  max="25"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                <select
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select diagnosis</option>
                  <option value="Autism Spectrum Disorder">Autism Spectrum Disorder</option>
                  <option value="ADHD">Attention Deficit Hyperactivity Disorder (ADHD)</option>
                  <option value="Learning Disability">Learning Disability</option>
                  <option value="Developmental Delay">Developmental Delay</option>
                  <option value="Down Syndrome">Down Syndrome</option>
                  <option value="Cerebral Palsy">Cerebral Palsy</option>
                  <option value="Intellectual Disability">Intellectual Disability</option>
                  <option value="Speech Disorder">Speech Disorder</option>
                  <option value="Language Disorder">Language Disorder</option>
                  <option value="Sensory Processing Disorder">Sensory Processing Disorder</option>
                  <option value="Anxiety Disorder">Anxiety Disorder</option>
                  <option value="Depression">Depression</option>
                  <option value="Bipolar Disorder">Bipolar Disorder</option>
                  <option value="Obsessive-Compulsive Disorder">Obsessive-Compulsive Disorder</option>
                  <option value="Tourette Syndrome">Tourette Syndrome</option>
                  <option value="Fragile X Syndrome">Fragile X Syndrome</option>
                  <option value="Prader-Willi Syndrome">Prader-Willi Syndrome</option>
                  <option value="Williams Syndrome">Williams Syndrome</option>
                  <option value="Fetal Alcohol Syndrome">Fetal Alcohol Syndrome</option>
                  <option value="Multiple Diagnoses">Multiple Diagnoses</option>
                  <option value="Undiagnosed">Undiagnosed</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Diagnosis</label>
                <input
                  type="number"
                  value={formData.yearsOfDiagnosis}
                  onChange={(e) => handleInputChange('yearsOfDiagnosis', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter years"
                  min="0"
                  max="25"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6">
          <button
            onClick={handleSave}
            className="bg-a text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
} 