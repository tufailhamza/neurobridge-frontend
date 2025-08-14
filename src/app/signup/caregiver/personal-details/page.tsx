'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/login/Header';
import { env } from '@/config/env';

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [caregiverRole, setCaregiverRole] = useState('');
  const [childAge, setChildAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [yearsOfDiagnosis, setYearsOfDiagnosis] = useState('');

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get all stored data
      const basicInfo = JSON.parse(localStorage.getItem('signup_basic') || '{}');
      const accountType = localStorage.getItem('signup_type');
      const generalInfo = JSON.parse(localStorage.getItem('signup_general') || '{}');
      const personalInfo = { caregiverRole, childAge, diagnosis, yearsOfDiagnosis };
      
      // Store personal details in localStorage for profile access
      localStorage.setItem('signup_personal', JSON.stringify(personalInfo));
      
      // Combine all data
      const signupData = {
        ...basicInfo,
        accountType,
        ...generalInfo,
        ...personalInfo,
        // Ensure all fields are strings as expected by backend
        childAge: childAge.toString(),
        yearsOfDiagnosis: yearsOfDiagnosis.toString()
      };
      
      console.log('Complete signup data:', signupData);
      
      // Send to backend API
      const response = await fetch(`${env.BACKEND_URL}/auth/signup/caregiver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      const signupResponse = await response.json();
      
      // Auto-login after successful signup
      try {
        const loginResponse = await fetch(`${env.BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signupData.email,
            password: signupData.password
          })
        });

        if (!loginResponse.ok) {
          throw new Error('Auto-login failed');
        }

        const loginData = await loginResponse.json();
        
        // Store the token and user info in localStorage (same as login page)
        localStorage.setItem('access_token', loginData.access_token);
        localStorage.setItem('user_role', loginData.role);
        localStorage.setItem('user_info', JSON.stringify(loginData.user));
        
        // Clear signup data
        localStorage.removeItem('signup_basic');
        localStorage.removeItem('signup_type');
        localStorage.removeItem('signup_general');
        
        // Redirect to caregiver home page (logged in)
        router.push('/caregiver/welcome');
        
      } catch (loginError) {
        console.error('Auto-login error:', loginError);
        // If auto-login fails, still redirect to welcome page
        router.push('/caregiver/welcome');
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      alert('Error creating account. Please try again.');
    }
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
                type="submit"
                className="w-full bg-a hover:bg-a-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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