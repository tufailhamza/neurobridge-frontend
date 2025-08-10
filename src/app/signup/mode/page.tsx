'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/login/Header';

export default function SignupModePage() {
  const router = useRouter();

  const handleCaregiverSignup = () => {
    // Store account type and navigate
    localStorage.setItem('signup_type', 'caregiver');
    router.push('/signup/caregiver');
  };

  const handleClinicianSignup = () => {
    // Store account type and navigate
    localStorage.setItem('signup_type', 'clinician');
    router.push('/signup/clinician');
  };

  return (
    <div className="min-h-screen bg-d">
      <Header />

      <div className="flex items-center justify-center">
        <div className="max-w-xl w-full space-y-8 p-8">
          <div className="">
            {/* Title */}
            <div className="text-left mb-12">
              <h1 className="text-3xl font-bold text-gray-900">
                I am a...
              </h1>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid md:grid-rows-2 gap-8">
              {/* Caregiver Card */}
              <div className="bg-white rounded-xl p-4 border-3 border-gray-400">
                <div className="text-left">
                  <h2 className="text-4xl font-semibold text-gray-700 mb-4">
                    Caregiver
                  </h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Parents/caregivers of neurodiverse individuals.
                  </p>
                  <button
                    onClick={handleCaregiverSignup}
                    className="w-full bg-transparent text-left text-a font-semibold"
                  >
                    Create Account →
                  </button>
                </div>
              </div>

              {/* Clinician Card */}
              <div className="bg-white rounded-xl p-4 border-3 border-gray-400">
                <div className="text-left">
                  <h2 className="text-4xl font-semibold text-gray-700 mb-4">
                    Clinician
                  </h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Providing specialized care, therapy or assessments for neurodiverse individuals, such as a licensed BCBA, speech language, occupational, and/or physical therapist.
                  </p>
                  <button
                    onClick={handleClinicianSignup}
                    className="w-full bg-transparent text-left text-a font-semibold"
                  >
                    Create Account →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 