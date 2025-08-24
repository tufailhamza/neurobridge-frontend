'use client';

import { useState } from 'react';
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

interface EditClinicianProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinician: ClinicianProfile;
  onSave: (updatedData: Partial<ClinicianProfile>) => void;
}

export default function EditClinicianProfileModal({ isOpen, onClose, clinician, onSave }: EditClinicianProfileModalProps) {
  const [formData, setFormData] = useState({
    prefix: clinician.prefix,
    first_name: clinician.first_name,
    last_name: clinician.last_name,
    email: clinician.email,
    country: clinician.country,
    city: clinician.city,
    state: clinician.state,
    zip_code: clinician.zip_code,
    clinician_type: clinician.clinician_type,
    specialty: clinician.specialty,
    license_number: clinician.license_number,
    area_of_expertise: clinician.area_of_expertise
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
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

      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(`${env.BACKEND_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Check if response is JSON before trying to parse it
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to update profile: ${response.status}`);
        } else {
          // Handle HTML error responses
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
        }
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
          <h2 className="text-2xl font-semibold text-b">Edit Profile</h2>
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

          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-500 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                <select
                  value={formData.prefix}
                  onChange={(e) => handleInputChange('prefix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter first name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter last name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter email"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-500 mb-4">Professional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinician Type</label>
                <select
                  value={formData.clinician_type}
                  onChange={(e) => handleInputChange('clinician_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="BCBA">BCBA</option>
                  <option value="BCBA/LBA">BCBA/LBA</option>
                  <option value="SLP">SLP</option>
                  <option value="CCC-SLP">CCC-SLP</option>
                  <option value="OTR">OTR</option>
                  <option value="OT/L">OT/L</option>
                  <option value="PT">PT</option>
                  <option value="DPT">DPT</option>
                  <option value="Specialist">Specialist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter license number"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter specialty"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area of Expertise</label>
                <textarea
                  value={formData.area_of_expertise}
                  onChange={(e) => handleInputChange('area_of_expertise', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Describe your area of expertise"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-500 mb-4">Location Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="IN">India</option>
                  <option value="BR">Brazil</option>
                  <option value="MX">Mexico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter state"
                  disabled={isLoading}
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  placeholder="Enter ZIP code"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-b text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
