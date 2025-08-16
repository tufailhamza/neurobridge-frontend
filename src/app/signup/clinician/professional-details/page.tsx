'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/login/Header';
import { env } from '@/config/env';

export default function ProfessionalDetailsPage() {
  const router = useRouter();
  const [clinicianType, setClinicianType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [areaOfExpertise, setAreaOfExpertise] = useState('');

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation - check if any field is empty
    if (!clinicianType || !licenseNumber || !areaOfExpertise) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      // Get all stored data
      const basicInfo = JSON.parse(localStorage.getItem('signup_basic') || '{}');
      const accountType = localStorage.getItem('signup_type');
      const generalInfo = JSON.parse(localStorage.getItem('signup_general') || '{}');
      const professionalInfo = { clinicianType, licenseNumber, areaOfExpertise };
      
      // Combine all data
      const signupData = {
        ...basicInfo,
        accountType,
        ...generalInfo,
        ...professionalInfo
      };
      
      console.log('Complete signup data:', signupData);
      
      // Send to backend API
      const response = await fetch(`${env.BACKEND_URL}/auth/signup/clinician`, {
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
        
        // Redirect to clinician home page (logged in)
        router.push('/clinician/welcome');
        
      } catch (loginError) {
        console.error('Auto-login error:', loginError);
        // If auto-login fails, still redirect to welcome page
        router.push('/clinician/welcome');
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
                  <option value="Complex Communication Needs">Complex Communication Needs</option>
                  <option value="Functional Behavior Assessment (FBA) / Analysis (FA)">Functional Behavior Assessment (FBA) / Analysis (FA)</option>
                  <option value="Severe Problem Behaviors (e.g., aggression, self-injury)">Severe Problem Behaviors (e.g., aggression, self-injury)</option>
                  <option value="Behavior Intervention Plans">Behavior Intervention Plans</option>
                  <option value="Skill Acquisition">Skill Acquisition</option>
                  <option value="Assessments and Evaluations">Assessments and Evaluations</option>
                  <option value="Functional Communication Training (FCT)">Functional Communication Training (FCT)</option>
                  <option value="Adaptive Living Skills">Adaptive Living Skills</option>
                  <option value="Social Skills Training">Social Skills Training</option>
                  <option value="Executive Functioning Support">Executive Functioning Support</option>
                  <option value="Feeding Therapy (behavioral)">Feeding Therapy (behavioral)</option>
                  <option value="Toilet Training">Toilet Training</option>
                  <option value="Sleep Training">Sleep Training</option>
                  <option value="Trauma-Informed ABA">Trauma-Informed ABA</option>
                  <option value="Vocational & Life Skills">Vocational & Life Skills</option>
                  <option value="Articulation & Phonological Disorders">Articulation & Phonological Disorders</option>
                  <option value="Receptive & Expressive Language Delays">Receptive & Expressive Language Delays</option>
                  <option value="Social Communication (Pragmatics)">Social Communication (Pragmatics)</option>
                  <option value="Literacy & Reading Intervention">Literacy & Reading Intervention</option>
                  <option value="Stuttering / Fluency Disorders">Stuttering / Fluency Disorders</option>
                  <option value="Voice Disorders">Voice Disorders</option>
                  <option value="Resonance Disorders (e.g., cleft palate)">Resonance Disorders (e.g., cleft palate)</option>
                  <option value="Augmentative & Alternative Communication (AAC)">Augmentative & Alternative Communication (AAC)</option>
                  <option value="Apraxia of Speech">Apraxia of Speech</option>
                  <option value="Pediatric Feeding Disorders">Pediatric Feeding Disorders</option>
                  <option value="Oral-Motor Therapy">Oral-Motor Therapy</option>
                  <option value="Dysphagia (Swallowing Disorders)">Dysphagia (Swallowing Disorders)</option>
                  <option value="Rumination">Rumination</option>
                  <option value="Sensory Processing Disorders (SPD)">Sensory Processing Disorders (SPD)</option>
                  <option value="Fine Motor Skills">Fine Motor Skills</option>
                  <option value="Visual-Motor Integration">Visual-Motor Integration</option>
                  <option value="Handwriting Intervention">Handwriting Intervention</option>
                  <option value="Self-Care & Daily Living Skills">Self-Care & Daily Living Skills</option>
                  <option value="Play-Based Therapy">Play-Based Therapy</option>
                  <option value="Developmental Coordination Disorder">Developmental Coordination Disorder</option>
                  <option value="Emotional Regulation">Emotional Regulation</option>
                  <option value="Gross Motor Delays">Gross Motor Delays</option>
                  <option value="Torticollis & Plagiocephaly">Torticollis & Plagiocephaly</option>
                  <option value="Gait Abnormalities">Gait Abnormalities</option>
                  <option value="Neuromuscular Disorders (e.g., CP, spina bifida)">Neuromuscular Disorders (e.g., CP, spina bifida)</option>
                  <option value="Stroke Rehabilitation">Stroke Rehabilitation</option>
                  <option value="Traumatic Brain Injury (TBI)">Traumatic Brain Injury (TBI)</option>
                  <option value="Vestibular & Balance Therapy">Vestibular & Balance Therapy</option>
                  <option value="Joint & Muscle Pain">Joint & Muscle Pain</option>
                  <option value="Scoliosis Management">Scoliosis Management</option>
                  <option value="Mobility & Strength Training">Mobility & Strength Training</option>
                  <option value="Gross Motor Skill Development">Gross Motor Skill Development</option>
                  <option value="Muscle Tone Regulation (Hypotonia, Hypertonia)">Muscle Tone Regulation (Hypotonia, Hypertonia)</option>
                  <option value="Strengthening and Endurance Building">Strengthening and Endurance Building</option>
                  <option value="Balance and Coordination Training">Balance and Coordination Training</option>
                  <option value="Gait Training and Mobility Improvement">Gait Training and Mobility Improvement</option>
                  <option value="Postural Control and Alignment">Postural Control and Alignment</option>
                  <option value="Motor Planning and Motor Learning">Motor Planning and Motor Learning</option>
                  <option value="Torticollis and Plagiocephaly Treatment">Torticollis and Plagiocephaly Treatment</option>
                  <option value="Orthotic Assessment and Management">Orthotic Assessment and Management</option>
                  <option value="Joint Range of Motion and Flexibility">Joint Range of Motion and Flexibility</option>
                  <option value="Adaptive Equipment Training (Walkers, Wheelchairs)">Adaptive Equipment Training (Walkers, Wheelchairs)</option>
                  <option value="Functional Mobility Training (Transfers, Stairs)">Functional Mobility Training (Transfers, Stairs)</option>
                  <option value="Sensory-Motor Integration">Sensory-Motor Integration</option>
                  <option value="Prevention of Secondary Complications">Prevention of Secondary Complications</option>
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