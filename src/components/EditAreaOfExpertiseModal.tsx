'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { env } from '@/config/env';

interface EditAreaOfExpertiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAreas: string[];
  onSave: (areas: string[]) => void;
}

const AREAS_OF_EXPERTISE = [
  'Complex Communication Needs',
  'Functional Behavior Assessment (FBA) / Analysis (FA)',
  'Severe Problem Behaviors (e.g., aggression, self-injury)',
  'Behavior Intervention Plans',
  'Skill Acquisition',
  'Assessments and Evaluations',
  'Functional Communication Training (FCT)',
  'Adaptive Living Skills',
  'Social Skills Training',
  'Executive Functioning Support',
  'Feeding Therapy (behavioral)',
  'Toilet Training',
  'Sleep Training',
  'Trauma-Informed ABA',
  'Vocational & Life Skills',
  'Articulation & Phonological Disorders',
  'Receptive & Expressive Language Delays',
  'Social Communication (Pragmatics)',
  'Literacy & Reading Intervention',
  'Stuttering / Fluency Disorders',
  'Voice Disorders',
  'Resonance Disorders (e.g., cleft palate)',
  'Augmentative & Alternative Communication (AAC)',
  'Apraxia of Speech',
  'Pediatric Feeding Disorders',
  'Oral-Motor Therapy',
  'Dysphagia (Swallowing Disorders)',
  'Rumination',
  'Sensory Processing Disorders (SPD)',
  'Fine Motor Skills',
  'Visual-Motor Integration',
  'Handwriting Intervention',
  'Self-Care & Daily Living Skills',
  'Play-Based Therapy',
  'Developmental Coordination Disorder',
  'Emotional Regulation',
  'Gross Motor Delays',
  'Torticollis & Plagiocephaly',
  'Gait Abnormalities',
  'Neuromuscular Disorders (e.g., CP, spina bifida)',
  'Stroke Rehabilitation',
  'Traumatic Brain Injury (TBI)',
  'Vestibular & Balance Therapy',
  'Joint & Muscle Pain',
  'Scoliosis Management',
  'Mobility & Strength Training',
  'Gross Motor Skill Development',
  'Muscle Tone Regulation (Hypotonia, Hypertonia)',
  'Strengthening and Endurance Building',
  'Balance and Coordination Training',
  'Gait Training and Mobility Improvement',
  'Postural Control and Alignment',
  'Motor Planning and Motor Learning',
  'Torticollis and Plagiocephaly Treatment',
  'Orthotic Assessment and Management',
  'Joint Range of Motion and Flexibility',
  'Adaptive Equipment Training (Walkers, Wheelchairs)',
  'Functional Mobility Training (Transfers, Stairs)',
  'Sensory-Motor Integration',
  'Prevention of Secondary Complications (Contractures, Deformities)'
];

export default function EditAreaOfExpertiseModal({ isOpen, onClose, currentAreas, onSave }: EditAreaOfExpertiseModalProps) {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(currentAreas);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update selectedAreas when currentAreas prop changes
  useEffect(() => {
    setSelectedAreas(currentAreas);
  }, [currentAreas]);

  const handleSave = async () => {
    try {
      // Get user info from localStorage
      const userInfo = localStorage.getItem('user_info');
      const userId = JSON.parse(userInfo || '{}').user_id;
      const accessToken = localStorage.getItem('access_token');
      
      if (!userId || !accessToken) {
        alert('User not authenticated. Please login again.');
        return;
      }

      // Make API call to update profile
      const response = await fetch(`${env.BACKEND_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          area_of_expertise: selectedAreas.join(', ') // Convert array to comma-separated string
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated successfully:', result);
        alert('Areas of expertise updated successfully!');
        onSave(selectedAreas);
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update profile:', errorData);
        alert(`Failed to update profile: ${errorData.detail || `Status: ${response.status}`}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const toggleArea = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header Row - Title and cross */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Areas of Expertise</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">Select your areas of expertise:</p>
          
          {/* Dropdown */}
          <div className="mb-6 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={toggleDropdown}
              className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-left text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
            >
              <span className={selectedAreas.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                {selectedAreas.length > 0 
                  ? `${selectedAreas.length} area(s) selected` 
                  : 'Select areas of expertise'
                }
              </span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown List */}
            {isDropdownOpen && (
              <div className="fixed z-[9999] w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto" 
                   style={{
                     top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 4 : 0,
                     left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left : 0,
                     width: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().width : 'auto'
                   }}>
                {AREAS_OF_EXPERTISE.map((area) => (
                  <label key={area} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAreas.includes(area)}
                      onChange={() => toggleArea(area)}
                      className="rounded border-gray-300 text-b focus:ring-b mr-3"
                    />
                    <span className="text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-a text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
