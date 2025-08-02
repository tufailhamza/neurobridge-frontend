'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/login/Header';

export default function ProfessionalDetailsPage() {
  const router = useRouter();
  const [clinicianType, setClinicianType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [areaOfExpertise, setAreaOfExpertise] = useState('');

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle account creation logic here
    console.log('Professional details:', { clinicianType, licenseNumber, areaOfExpertise });
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
                Professional Details
              </h1>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-6">
              {/* Clinician Type Field */}
              <div>
                <label htmlFor="clinicianType" className="block text-sm font-medium text-b mb-2">
                  Clinician Type
                </label>
                <select
                  id="clinicianType"
                  name="clinicianType"
                  value={clinicianType}
                  onChange={(e) => setClinicianType(e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:outline-none"
                >
                  <option value="">Select clinician type</option>
                  <option value="BCBA">Board Certified Behavior Analyst (BCBA)</option>
                  <option value="BCaBA">Board Certified Assistant Behavior Analyst (BCaBA)</option>
                  <option value="RBT">Registered Behavior Technician (RBT)</option>
                  <option value="SLP">Speech Language Pathologist</option>
                  <option value="OT">Occupational Therapist</option>
                  <option value="PT">Physical Therapist</option>
                  <option value="Psychologist">Psychologist</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Specialist">Specialist</option>
                  <option value="Therapist">Therapist</option>
                  <option value="Counselor">Counselor</option>
                  <option value="Social Worker">Social Worker</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* License Number Field */}
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-b mb-2">
                  License Number
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:outline-none"
                  placeholder="License number"
                />
              </div>

              {/* Area of Expertise Field */}
              <div>
                <label htmlFor="areaOfExpertise" className="block text-sm font-medium text-b mb-2">
                  Area of Expertise
                </label>
                <select
                  id="areaOfExpertise"
                  name="areaOfExpertise"
                  value={areaOfExpertise}
                  onChange={(e) => setAreaOfExpertise(e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:outline-none"
                >
                  <option value="">Select area of expertise</option>
                  <option value="Autism Spectrum Disorder">Autism Spectrum Disorder</option>
                  <option value="ADHD">Attention Deficit Hyperactivity Disorder (ADHD)</option>
                  <option value="Learning Disabilities">Learning Disabilities</option>
                  <option value="Developmental Delays">Developmental Delays</option>
                  <option value="Speech Disorders">Speech Disorders</option>
                  <option value="Language Disorders">Language Disorders</option>
                  <option value="Motor Skills">Motor Skills</option>
                  <option value="Sensory Processing">Sensory Processing</option>
                  <option value="Behavioral Issues">Behavioral Issues</option>
                  <option value="Social Skills">Social Skills</option>
                  <option value="Cognitive Development">Cognitive Development</option>
                  <option value="Emotional Regulation">Emotional Regulation</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Depression">Depression</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Family Therapy">Family Therapy</option>
                  <option value="Early Intervention">Early Intervention</option>
                  <option value="School Psychology">School Psychology</option>
                  <option value="Neuropsychology">Neuropsychology</option>
                  <option value="Pediatric Neurology">Pediatric Neurology</option>
                  <option value="Other">Other</option>
                </select>
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