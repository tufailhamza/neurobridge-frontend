export interface Clinician {
  user_id: string;  
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
  clinician_type: ClinicianType;
  license_number: string;
  area_of_expertise: AreaOfExpertiseClinician;
  bio: string;
  approach: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// Enums for the select options
export type ClinicianType = 
  | 'BCBA'
  | 'BCBA/LBA'
  | 'SLP'
  | 'CCC-SLP'
  | 'OTR'
  | 'OT/L'
  | 'PT'
  | 'DPT';

  export type AreaOfExpertiseClinician =
  | 'Complex Communication Needs'
  | 'Functional Behavior Assessment (FBA) / Analysis (FA)'
  | 'Severe Problem Behaviors (e.g., aggression, self-injury)'
  | 'Behavior Intervention Plans'
  | 'Skill Acquisition'
  | 'Assessments and Evaluations'
  | 'Functional Communication Training (FCT)'
  | 'Adaptive Living Skills'
  | 'Social Skills Training'
  | 'Executive Functioning Support'
  | 'Feeding Therapy (behavioral)'
  | 'Toilet Training'
  | 'Sleep Training'
  | 'Trauma-Informed ABA'
  | 'Vocational & Life Skills'
  | 'Articulation & Phonological Disorders'
  | 'Receptive & Expressive Language Delays'
  | 'Social Communication (Pragmatics)'
  | 'Literacy & Reading Intervention'
  | 'Stuttering / Fluency Disorders'
  | 'Voice Disorders'
  | 'Resonance Disorders (e.g., cleft palate)'
  | 'Augmentative & Alternative Communication (AAC)'
  | 'Apraxia of Speech'
  | 'Pediatric Feeding Disorders'
  | 'Oral-Motor Therapy'
  | 'Dysphagia (Swallowing Disorders)'
  | 'Rumination'
  | 'Sensory Processing Disorders (SPD)'
  | 'Fine Motor Skills'
  | 'Visual-Motor Integration'
  | 'Handwriting Intervention'
  | 'Self-Care & Daily Living Skills'
  | 'Play-Based Therapy'
  | 'Developmental Coordination Disorder'
  | 'Emotional Regulation'
  | 'Gross Motor Delays'
  | 'Torticollis & Plagiocephaly'
  | 'Gait Abnormalities'
  | 'Neuromuscular Disorders (e.g., CP, spina bifida)'
  | 'Stroke Rehabilitation'
  | 'Traumatic Brain Injury (TBI)'
  | 'Vestibular & Balance Therapy'
  | 'Joint & Muscle Pain'
  | 'Scoliosis Management'
  | 'Mobility & Strength Training'
  | 'Gross Motor Skill Development'
  | 'Muscle Tone Regulation (Hypotonia, Hypertonia)'
  | 'Strengthening and Endurance Building'
  | 'Balance and Coordination Training'
  | 'Gait Training and Mobility Improvement'
  | 'Postural Control and Alignment'
  | 'Motor Planning and Motor Learning'
  | 'Torticollis and Plagiocephaly Treatment'
  | 'Orthotic Assessment and Management'
  | 'Joint Range of Motion and Flexibility'
  | 'Adaptive Equipment Training (Walkers, Wheelchairs)'
  | 'Functional Mobility Training (Transfers, Stairs)'
  | 'Sensory-Motor Integration'
  | 'Prevention of Secondary Complications (Contractures, Deformities)';

// Country and State types for the dropdowns
export type Country = 'US' | 'CA' | 'UK' | 'AU' | 'DE' | 'FR' | 'JP' | 'IN' | 'BR' | 'MX';

export type USState = 
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY';
  
