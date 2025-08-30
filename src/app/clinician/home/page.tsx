'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClinicianSidebar from '../sidebar';
import FeedCard from '@/components/FeedCard';
import { FeedCard as FeedCardType } from '@/types/FeedCard';
import { env } from '@/config/env';

export default function ClinicianHomePage() {
  const router = useRouter();
  const [feedCards, setFeedCards] = useState<FeedCardType[]>([]);
  const [filteredFeedCards, setFilteredFeedCards] = useState<FeedCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [clinicianFilter, setClinicianFilter] = useState<string>('');
  const [contentFilter, setContentFilter] = useState<string>('');
  const [diagnosisFilter, setDiagnosisFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  
  // Clinicians states
  const [unsubscribedClinicians, setUnsubscribedClinicians] = useState<any[]>([]);
  const [displayedClinicians, setDisplayedClinicians] = useState<number>(5);
  const [cliniciansLoading, setCliniciansLoading] = useState(true);
  const [subscribingClinicians, setSubscribingClinicians] = useState<Set<number>>(new Set());

  // Filter function
  const applyFilters = (cards: FeedCardType[]) => {
    return cards.filter(card => {
      // If no filters are applied, show all cards
      if (!clinicianFilter && !contentFilter && !diagnosisFilter && !stateFilter) {
        return true;
      }
      
      // Apply clinician filter (check if any tag matches the clinician type)
      if (clinicianFilter && clinicianFilter !== 'Clinician') {
        const hasClinicianMatch = card.tags.some(tag => 
          tag.toLowerCase().includes(clinicianFilter.toLowerCase())
        );
        if (!hasClinicianMatch) return false;
      }
      
      // Apply content filter (check if any tag matches the content type)
      if (contentFilter && contentFilter !== 'Content') {
        const hasContentMatch = card.tags.some(tag => 
          tag.toLowerCase().includes(contentFilter.toLowerCase())
        );
        if (!hasContentMatch) return false;
      }
      
      // Apply diagnosis filter (check if any tag matches the diagnosis)
      if (diagnosisFilter && diagnosisFilter !== 'Diagnosis') {
        const hasDiagnosisMatch = card.tags.some(tag => 
          tag.toLowerCase().includes(diagnosisFilter.toLowerCase())
        );
        if (!hasDiagnosisMatch) return false;
      }
      
      // Apply state filter (check if any tag matches the state)
      if (stateFilter && stateFilter !== 'State') {
        const hasStateMatch = card.tags.some(tag => 
          tag.toLowerCase().includes(stateFilter.toLowerCase())
        );
        if (!hasStateMatch) return false;
      }
      
      return true;
    });
  };

  // Apply filters whenever filters or feedCards change
  useEffect(() => {
    setFilteredFeedCards(applyFilters(feedCards));
  }, [clinicianFilter, contentFilter, diagnosisFilter, stateFilter, feedCards]);

  // Fetch clinicians except current user
  useEffect(() => {
    const fetchCliniciansExcept = async () => {
      try {
        setCliniciansLoading(true);
        // Get user_id from localStorage or context (you may need to adjust this based on your auth setup)
        const userInfo = localStorage.getItem('user_info');
        const user_id = JSON.parse(userInfo || '{}').user_id;
        const response = await fetch(`${env.BACKEND_URL}/clinicians/except/${user_id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch clinicians: ${response.status}`);
        }
        
        const data = await response.json();
        setUnsubscribedClinicians(data || []);
      } catch (err) {
        console.error('Error fetching clinicians:', err);
        // Fallback to empty array if API fails
        setUnsubscribedClinicians([]);
      } finally {
        setCliniciansLoading(false);
      }
    };

    fetchCliniciansExcept();
  }, []);

  // Subscribe to clinician function
  const handleSubscribe = async (clinicianId: number) => {
    try {
      setSubscribingClinicians(prev => new Set(prev).add(clinicianId));
      
      const userInfo = localStorage.getItem('user_info');
      const clinician_id = JSON.parse(userInfo || '{}').user_id;
      
      const response = await fetch(`${env.BACKEND_URL}/clinicians/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiver_id: clinicianId,
          clinician_id: clinician_id
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to subscribe: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Subscribe response:', data);
      
      // Remove the subscribed clinician from the list
      setUnsubscribedClinicians(prev => prev.filter(clinician => clinician.user_id !== clinicianId));
      
    } catch (error) {
      console.error('Error subscribing to clinician:', error);
      // You might want to show a toast notification here
    } finally {
      setSubscribingClinicians(prev => {
        const newSet = new Set(prev);
        newSet.delete(clinicianId);
        return newSet;
      });
    }
  };

  // Fetch feed data from backend
  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        setLoading(true);
        
        // First, check if backend is accessible
        console.log('Checking backend health at:', `${env.BACKEND_URL}/health`);
        const healthResponse = await fetch(`${env.BACKEND_URL}/health`);
        console.log('Health check status:', healthResponse.status);
        
        if (!healthResponse.ok) {
          throw new Error(`Backend is not accessible: ${healthResponse.status}`);
        }
        
                        console.log('Fetching posts from:', `${env.BACKEND_URL}/posts/?limit=20`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000000); // 10 second timeout
        
        const response = await fetch(`${env.BACKEND_URL}/posts/?limit=20`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`Failed to fetch posts: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        console.log('Data type:', typeof data);
        console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
        
        // If no posts found, use fallback data for testing
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.log('No posts found, using fallback data');
          const fallbackData = [
            {
              id: "1",
              image_url: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Sample+Post",
              title: "Understanding Autism Spectrum Disorder",
              user_id: "1",
              user_name: "Dr. Sarah Johnson",
              date: "2024-01-15",
              read_time: "5 min read",
              tags: ["Autism", "Behavioral", "Therapy"],
              price: 0,
              html_content: "<p>Sample content about autism...</p>",
              allow_comments: true,
              tier: "free",
              collection: null,
              attachments: [],
              date_published: "2024-01-15T10:00:00Z"
            },
            {
              id: "2",
              image_url: "https://via.placeholder.com/400x300/10B981/FFFFFF?text=Speech+Therapy",
              title: "Speech Therapy Techniques for Children",
              user_id: "2",
              user_name: "Dr. Michael Chen",
              date: "2024-01-14",
              read_time: "8 min read",
              tags: ["Speech Therapy", "Communication", "SLP"],
              price: 9.99,
              html_content: "<p>Advanced speech therapy techniques...</p>",
              allow_comments: true,
              tier: "paid",
              collection: null,
              attachments: [],
              date_published: "2024-01-14T14:30:00Z"
            }
          ];
          setFeedCards(fallbackData);
        } else {
          setFeedCards(data.results || data || []);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching feed data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch feed data');
        // Fallback to empty array if API fails
        setFeedCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, []);

  return (
    <div className="h-full bg-d">
      {/* Sidebar */}
      <ClinicianSidebar />
      
      {/* Main Content */}
      <div className="ml-64 h-full flex">
        
        {/* Column B - Scrollable */}
        <div className="w-4/5 p-6 ">
          <div className=" rounded-lg h-full">
            <div className="flex space-x-4 mb-6">
                <div className="bg-b text-white px-4 py-2 rounded-full font-bold">
                    My Feed
                </div>
                <div className="border-2 border-b text-b px-4 py-2 rounded-full font-bold">
                    Discover
                </div>
            </div>
            {/* Scrollable Cards List */}
            <div className="space-y-6 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-b mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading feed...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-b text-white rounded-lg hover:bg-b-hover transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredFeedCards.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    {feedCards.length === 0 ? 'No posts found.' : 'No posts match the selected filters.'}
                  </p>
                </div>
              ) : (
                filteredFeedCards.map((card) => (
                  <FeedCard key={card.id} card={card} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column C - Sticky */}
        <div className="w-128 p-6">
          <div className="bg-white sticky top-6">
            {/* Row 1 - Filters Header */}
            <div className="mb-6 border-gray-200 border-2 rounded-2xl p-6">
              {/* Inner row - Title and Icon */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-400 mb-4">Filters</h3>
                <div className="flex items-center space-x-2">
                  {(clinicianFilter && clinicianFilter !== 'Clinician') || 
                   (contentFilter && contentFilter !== 'Content') || 
                   (diagnosisFilter && diagnosisFilter !== 'Diagnosis') || 
                   (stateFilter && stateFilter !== 'State') ? (
                    <button 
                      onClick={() => {
                        setClinicianFilter('');
                        setContentFilter('');
                        setDiagnosisFilter('');
                        setStateFilter('');
                      }}
                      className="text-sm text-b hover:underline"
                    >
                      Clear Filters
                    </button>
                  ) : null}
                  <div className="w-6 h-6">
                    <svg className="w-full h-full text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Inner row - Clinician and Content dropdowns */}
              <div className="flex space-x-3 mb-3">
                <div className="flex-1">

                                      <select 
                      className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent font-semibold appearance-none bg-white pr-10"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1L6 6L11 1' stroke='%2313375B' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center'
                      }}
                      value={clinicianFilter}
                      onChange={(e) => setClinicianFilter(e.target.value)}
                    >
                    <option>Clinician</option>
                    <option>BCBA</option>
                    <option>LBA</option>
                    <option>BCBA/LBA</option>
                    <option>SLP</option>
                    <option>CCC-SLP</option>
                    <option>OTR</option>
                    <option>OT/L</option>
                    <option>OTR/L</option>
                    <option>PT</option>
                    <option>DPT</option>
                  </select>
                </div>
                <div className="flex-1">

                  <select 
                    className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent font-semibold appearance-none bg-white pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1L6 6L11 1' stroke='%2313375B' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center'
                    }}
                    value={contentFilter}
                    onChange={(e) => setContentFilter(e.target.value)}
                  >
                    <option>Content</option>
                    <option>Speech & Language</option>
                    <option>Functional Communication</option>
                    <option>Behavior Support</option>
                    <option>Fine Motor Skills</option>
                    <option>Sensory & Self-Regulation</option>
                    <option>Gross Motor Skills</option>
                    <option>Skill Acquisition</option>
                    <option>Positive Behavior Support</option>
                    <option>Toileting</option>
                    <option>Communication Tools & Alternatives (PECS, AAC)</option>
                    <option>Feeding & Eating Support</option>
                    <option>Activities of Daily Living</option>
                    <option>Planning and Moving (Motor Planning)</option>
                    <option>Walking, Balance & Moving Safely</option>
                  </select>
                </div>
              </div>
              
              {/* Inner row - Diagnosis and State dropdowns */}
              <div className="flex space-x-3">
                <div className="flex-1">

                  <select 
                    className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent font-semibold appearance-none bg-white pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1L6 6L11 1' stroke='%2313375B' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center'
                    }}
                    value={diagnosisFilter}
                    onChange={(e) => setDiagnosisFilter(e.target.value)}
                  >
                    <option>Diagnosis</option>
                    <option>Dyslexia</option>
                    <option>Dyscalculia</option>
                    <option>Dysgraphia</option>
                    <option>Auditory Processing Disorder (APD)</option>
                    <option>Nonverbal Learning Disability</option>
                    <option>Autism Spectrum Disorder (ASD)</option>
                    <option>ADHD / ADD</option>
                    <option>Tourette Syndrome</option>
                    <option>Generalized Anxiety Disorder</option>
                    <option>Depression</option>
                    <option>Bipolar Disorder</option>
                    <option>Oppositional Defiant Disorder (ODD)</option>
                    <option>Conduct Disorder</option>
                    <option>Selective Mutism</option>
                    <option>Seizure Disorders</option>
                    <option>Mild, Moderate, or Severe Intellectual Disability</option>
                    <option>Down Syndrome</option>
                    <option>Fragile X Syndrome</option>
                    <option>Global Developmental Delay</option>
                    <option>Delayed Speech/Language Development</option>
                    <option>Delayed Motor Development</option>
                    <option>Delayed Cognitive Development</option>
                    <option>Expressive Language Disorder</option>
                    <option>Receptive Language Disorder</option>
                    <option>Speech Disorder</option>
                    <option>Childhood Apraxia of Speech</option>
                    <option>Stuttering</option>
                    <option>Cerebral Palsy</option>
                    <option>Muscular Dystrophy</option>
                    <option>Fetal Alcohol Spectrum Disorders (FASD)</option>
                    <option>Sensory Processing Disorder</option>
                    <option>Traumatic Brain Injury (TBI)</option>
                    <option>Vision Impairments / Blindness</option>
                    <option>Hearing Impairments / Deafness</option>
                    <option>Multiple Disabilities</option>
                  </select>
                </div>
                <div className="flex-1">

                  <select 
                    className="w-full text-b px-3 py-2 border border-b rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent font-semibold appearance-none bg-white pr-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1L6 6L11 1' stroke='%2313375B' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center'
                      }}
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                  >
                    <option>State</option>
                    <option>Alabama</option>
                    <option>Alaska</option>
                    <option>Arizona</option>
                    <option>Arkansas</option>
                    <option>California</option>
                    <option>Colorado</option>
                    <option>Connecticut</option>
                    <option>Delaware</option>
                    <option>Florida</option>
                    <option>Georgia</option>
                    <option>Hawaii</option>
                    <option>Idaho</option>
                    <option>Illinois</option>
                    <option>Indiana</option>
                    <option>Iowa</option>
                    <option>Kansas</option>
                    <option>Kentucky</option>
                    <option>Louisiana</option>
                    <option>Maine</option>
                    <option>Maryland</option>
                    <option>Massachusetts</option>
                    <option>Michigan</option>
                    <option>Minnesota</option>
                    <option>Mississippi</option>
                    <option>Missouri</option>
                    <option>Montana</option>
                    <option>Nebraska</option>
                    <option>Nevada</option>
                    <option>New Hampshire</option>
                    <option>New Jersey</option>
                    <option>New Mexico</option>
                    <option>New York</option>
                    <option>North Carolina</option>
                    <option>North Dakota</option>
                    <option>Ohio</option>
                    <option>Oklahoma</option>
                    <option>Oregon</option>
                    <option>Pennsylvania</option>
                    <option>Rhode Island</option>
                    <option>South Carolina</option>
                    <option>South Dakota</option>
                    <option>Tennessee</option>
                    <option>Texas</option>
                    <option>Utah</option>
                    <option>Vermont</option>
                    <option>Virginia</option>
                    <option>Washington</option>
                    <option>West Virginia</option>
                    <option>Wisconsin</option>
                    <option>Wyoming</option>
                    <option>District of Columbia</option>
                    <option>American Samoa</option>
                    <option>Guam</option>
                    <option>Northern Mariana Islands</option>
                    <option>Puerto Rico</option>
                    <option>U.S. Virgin Islands</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Row 2 - Clinicians you may know */}
            <div className='border-2 border-gray-200 rounded-2xl p-6'>
              <h3 className="text-lg text-gray-400 mb-4">Clinicians you may be interested in</h3>
              
              {/* Vertical list of clinicians */}
              <div className="space-y-3">
                {cliniciansLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-b mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading clinicians...</p>
                  </div>
                ) : unsubscribedClinicians.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No clinicians available</p>
                  </div>
                ) : (
                  <>
                    {unsubscribedClinicians.slice(0, displayedClinicians).map((clinician, index) => (
                      <div key={clinician.user_id || index} className="flex items-center justify-between rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-b rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {clinician.first_name ? clinician.first_name.charAt(0).toUpperCase() : 'C'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-black">
                              {clinician.prefix ? `${clinician.prefix} ${clinician.first_name} ${clinician.last_name}` : `${clinician.first_name} ${clinician.last_name}`}
                            </div>
                            <div className="text-sm text-gray-400">
                              {clinician.specialty || clinician.clinician_type || 'Clinician'}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleSubscribe(clinician.user_id)}
                          disabled={subscribingClinicians.has(clinician.user_id)}
                          className={`px-3 py-1 font-semibold text-sm ${
                            subscribingClinicians.has(clinician.user_id)
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-b hover:bg-b hover:text-white rounded transition-colors'
                          }`}
                        >
                          {subscribingClinicians.has(clinician.user_id) ? 'Subscribing...' : 'Subscribe'}
                        </button>
                      </div>
                    ))}
                    
                    {/* See all button */}
                    {unsubscribedClinicians.length > displayedClinicians && (
                      <div className="text-left pt-2">
                        <button 
                          onClick={() => router.push('/clinician/subscribed?tab=discover')}
                          className="text-b text-sm font-bold hover:underline"
                        >
                          See all
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
