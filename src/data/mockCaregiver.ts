import { Caregiver } from '@/types/Caregiver';

export const mockCaregiver: Caregiver = {
  // Basic Information
  firstName: "Sarah",
  lastName: "Johnson",
  username: "sarah_j_caregiver",
  
  // Location
  country: "United States",
  city: "San Francisco",
  state: "California",
  zipCode: "94102",
  
  // Caregiving Details
  caregiverRole: "Parent",
  childsAge: 8,
  diagnosis: "Autism Spectrum Disorder",
  yearsOfDiagnosis: 3,
  
  // Privacy Settings
  makeNamePublic: true,
  makePersonalDetailsPublic: false,
  
  // Images
  profileImage: null,
  coverImage: null,
  
  // Content and Preferences
  contentPreferencesTags: [
  ],
  bio: "Dedicated parent of an amazing 8-year-old with ASD. Passionate about learning and sharing experiences with other caregivers. Always looking for new strategies and resources to support my child's development and well-being.",
  
  // Lists
  subscribedCliniciansIds: [
    "dr_sarah_smith_001",
    "dr_michael_chen_002", 
    "dr_emily_rodriguez_003",
    "dr_robert_wilson_004"
  ],
  purchasedFeedContentIds: [
    "1", // Understanding Autism Spectrum Disorder
    "2", // Speech Therapy Techniques
    "4", // Behavioral Intervention Plans
    "6"  // Social Skills Training
  ]
}; 