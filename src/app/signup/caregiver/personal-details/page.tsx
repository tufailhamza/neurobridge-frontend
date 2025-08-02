'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/login/Header';

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [caregiverRole, setCaregiverRole] = useState('');
  const [childAge, setChildAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [yearsOfDiagnosis, setYearsOfDiagnosis] = useState('');

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle account creation logic here
    console.log('Personal details:', { caregiverRole, childAge, diagnosis, yearsOfDiagnosis });
    // Navigate to success page or dashboard
    // router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-d">
      <Header />
      
      <div className="flex items-center justify-center">
        <div className="max-w-xl w-full space-y-8 p-8">
          <div className="">
            {/* Title */}
            <div className="text-left mb-2">
              <h1 className="text-sm text-b">
                Page 2 of 2
              </h1>
            </div>
            <div className="text-left mb-8">
              <h1 className="text-3xl font-bold text-b">
                Personal Details
              </h1>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-6">
              {/* Caregiver Role Field */}
              <div>
                <label htmlFor="caregiverRole" className="block text-sm font-medium text-b mb-2">
                  Caregiver Role
                </label>
                <select
                  id="caregiverRole"
                  name="caregiverRole"
                  value={caregiverRole}
                  onChange={(e) => setCaregiverRole(e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:outline-none"
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

              {/* Child's Age Field */}
              <div>
                <label htmlFor="childAge" className="block text-sm font-medium text-b mb-2">
                  Child&apos;s Age
                </label>
                <input
                  id="childAge"
                  name="childAge"
                  type="number"
                  min="0"
                  max="25"
                  required
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:outline-none"
                  placeholder="Years old"
                />
              </div>

              {/* Diagnosis Field */}
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-b mb-2">
                  Diagnosis
                </label>
                <select
                  id="diagnosis"
                  name="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:outline-none"
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

              {/* Years of Diagnosis Field */}
              <div>
                <label htmlFor="yearsOfDiagnosis" className="block text-sm font-medium text-b mb-2">
                  Years of Diagnosis
                </label>
                <input
                  id="yearsOfDiagnosis"
                  name="yearsOfDiagnosis"
                  type="number"
                  min="0"
                  max="25"
                  required
                  value={yearsOfDiagnosis}
                  onChange={(e) => setYearsOfDiagnosis(e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:outline-none"
                  placeholder="Years"
                />
              </div>

              {/* Create Account Button */}
              <button
                type="button"
                className="w-full bg-a hover:bg-a-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => window.location.href = '/caregiver/welcome'}
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 