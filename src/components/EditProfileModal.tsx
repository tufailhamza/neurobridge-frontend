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

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
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
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-6 text-gray-800">
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
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                >
                  <option value="California">California</option>
                  <option value="New York">New York</option>
                  <option value="Texas">Texas</option>
                  <option value="Florida">Florida</option>
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
                >
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Sibling">Sibling</option>
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
                >
                  <option value="Autism Spectrum Disorder">Autism Spectrum Disorder</option>
                  <option value="ADHD">ADHD</option>
                  <option value="Down Syndrome">Down Syndrome</option>
                  <option value="Cerebral Palsy">Cerebral Palsy</option>
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
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6">
          <button
            onClick={handleSave}
            className="bg-a text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 