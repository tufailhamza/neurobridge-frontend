export interface Caregiver {
  // Basic Information
  firstName: string;
  lastName: string;
  username: string;
  
  // Location
  country: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Caregiving Details
  caregiverRole: string;
  childsAge: number;
  diagnosis: string;
  yearsOfDiagnosis: number;
  
  // Privacy Settings
  makeNamePublic: boolean;
  makePersonalDetailsPublic: boolean;
  
  // Images
  profileImage: string | null;
  coverImage: string | null;
  
  // Content and Preferences
  contentPreferencesTags: string[];
  bio: string;
  
  // Lists
  subscribedCliniciansIds: string[];
  purchasedFeedContentIds: string[];
} 