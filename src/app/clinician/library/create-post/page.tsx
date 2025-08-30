'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ClinicianSidebar from '../../sidebar';
import { Collection } from '@/types/Collection';
import { env } from '@/config/env';

// Dynamically import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="w-full h-96 text-black bg-gray-100 rounded-md animate-pulse flex items-center justify-center">Loading editor...</div>
});

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('Title goes here');
  const [content, setContent] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [price, setPrice] = useState(0);
  const [allowComments, setAllowComments] = useState(true);
  const [tier, setTier] = useState('public');
  const [collection, setCollection] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [isCollectionsDropdownOpen, setIsCollectionsDropdownOpen] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  
  // Schedule Release State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Function to fetch user collections
  const fetchUserCollections = async () => {
    try {
      setIsLoadingCollections(true);
      const accessToken = localStorage.getItem('access_token');
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      
      if (!accessToken || !userInfo.user_id) {
        console.error('No access token or user info found');
        return;
      }

      const response = await fetch(`${env.BACKEND_URL}/collections/user/${userInfo.user_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch collections: ${response.status}`);
      }

      const collectionsData = await response.json();
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching collections:', error);
      // Don't show alert for collections fetch error, just log it
    } finally {
      setIsLoadingCollections(false);
    }
  };

  // Function to load a draft for editing
  const loadDraft = (draftId: number) => {
    try {
      const storedDrafts = JSON.parse(localStorage.getItem('clinician_drafts') || '[]');
      const draft = storedDrafts.find((d: any) => d.id === draftId);
      
      if (draft) {
        setTitle(draft.title);
        setContent(draft.content);
        setCoverImagePreview(draft.coverImageUrl || '');
        setTags(draft.tags || []);
        setPrice(draft.price || 0);
        setAllowComments(draft.allowComments !== undefined ? draft.allowComments : true);
        setTier(draft.tier || 'public');
        setCollection(draft.collection || '');
        setAttachmentPreviews(draft.attachments || []);
        
        // Load schedule release data
        if (draft.isScheduled) {
          setIsScheduled(true);
          setScheduledDate(draft.scheduledDate || '');
          setScheduledTime(draft.scheduledTime || '');
        }
        
        console.log('Draft loaded:', draft);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  // Function to handle schedule release toggle
  const handleScheduleToggle = () => {
    if (isScheduled) {
      // If turning off scheduling, clear the scheduled date/time
      setIsScheduled(false);
      setScheduledDate('');
      setScheduledTime('');
    } else {
      // If turning on scheduling, set isScheduled to true
      setIsScheduled(true);
      // Set default date to tomorrow and time to current time + 1 hour
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
      
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1);
      setScheduledTime(nextHour.toTimeString().slice(0, 5));
    }
  };

  // Function to format scheduled date for display
  const formatScheduledDate = () => {
    if (!scheduledDate || !scheduledTime) return '';
    
    const date = new Date(`${scheduledDate}T${scheduledTime}`);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Function to create a new collection
  const createCollection = async (name: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      
      console.log('Access token:', accessToken ? 'Present' : 'Missing');
      console.log('User info:', userInfo);
      
      if (!accessToken || !userInfo.user_id) {
        throw new Error('No access token or user info found');
      }

      console.log('Making request to:', `${env.BACKEND_URL}/collections`);
      console.log('Request headers:', {
        'Authorization': `Bearer ${accessToken ? accessToken.substring(0, 20) + '...' : 'None'}`,
        'Content-Type': 'application/json',
      });
      console.log('Request body:', { name });
      
      const response = await fetch(`${env.BACKEND_URL}/collections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`Failed to create collection: ${response.statusText}`);
      }

      const newCollection = await response.json();
      
      // Add the new collection to the local state
      setCollections(prev => [...prev, newCollection]);
      
      // Close modal and reset form
      setIsCreateCollectionModalOpen(false);
      setNewCollectionName('');
      
      // Show success message (you can replace this with a toast notification)
      alert('Collection created successfully!');
      
    } catch (error) {
      console.error('Error creating collection:', error);
      alert(`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Check authentication on component mount and fetch collections
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    
    console.log('Component mount - Access token:', accessToken ? 'Present' : 'Missing');
    console.log('Component mount - User role:', userRole);
    
    if (!accessToken) {
      alert('Please log in to create a post');
      router.push('/login');
      return;
    }

    // Test authentication by making a simple request
    const testAuth = async () => {
      try {
        const response = await fetch(`${env.BACKEND_URL}/health`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        console.log('Auth test response:', response.status);
      } catch (error) {
        console.error('Auth test error:', error);
      }
    };
    
    testAuth();

    // Fetch user collections after authentication check
    fetchUserCollections();

    // Check if we're editing a draft
    const urlParams = new URLSearchParams(window.location.search);
    const draftId = urlParams.get('draft');
    
    if (draftId) {
      setIsEditingDraft(true);
      loadDraft(parseInt(draftId));
    }
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.collections-dropdown')) {
        setIsCollectionsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTitleClick = () => {
    setIsTitleEditing(true);
  };

  const handleTitleBlur = () => {
    setIsTitleEditing(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // File upload handlers
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachmentFiles(prev => [...prev, ...files]);
      
      // Create previews for new files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachmentPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Check if we're editing an existing draft
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get('draft');
      
      let draft;
      if (draftId) {
        // Update existing draft
        draft = {
          id: parseInt(draftId),
          title: title.trim() || 'Untitled Draft',
          content: content,
          coverImageUrl: coverImagePreview,
          tags,
          price: tier === 'paid' ? price : 0,
          allowComments,
          tier,
          collection,
          attachments: attachmentPreviews,
          date_created: new Date().toISOString(),
          user_id: JSON.parse(localStorage.getItem('user_info') || '{}').user_id || 0,
          isScheduled,
          scheduledDate,
          scheduledTime
        };
      } else {
        // Create new draft
        draft = {
          id: Date.now(), // Use timestamp as temporary ID
          title: title.trim() || 'Untitled Draft',
          content: content,
          coverImageUrl: coverImagePreview,
          tags,
          price: tier === 'paid' ? price : 0,
          allowComments,
          tier,
          collection,
          attachments: attachmentPreviews,
          date_created: new Date().toISOString(),
          user_id: JSON.parse(localStorage.getItem('user_info') || '{}').user_id || 0,
          isScheduled,
          scheduledDate,
          scheduledTime
        };
      }

      // Get existing drafts from localStorage
      const existingDrafts = JSON.parse(localStorage.getItem('clinician_drafts') || '[]');
      
      let updatedDrafts;
      if (draftId) {
        // Update existing draft
        updatedDrafts = existingDrafts.map((d: any) => d.id === parseInt(draftId) ? draft : d);
      } else {
        // Add new draft
        updatedDrafts = [...existingDrafts, draft];
      }
      
      // Save to localStorage
      localStorage.setItem('clinician_drafts', JSON.stringify(updatedDrafts));
      
      console.log('Draft saved:', draft);
      alert(draftId ? 'Draft updated successfully!' : 'Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content before publishing');
      return;
    }

    // Validate scheduled date if scheduling is enabled
    if (isScheduled) {
      if (!scheduledDate || !scheduledTime) {
        alert('Please set a scheduled date and time');
        return;
      }
      
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      
      if (scheduledDateTime <= now) {
        alert('Scheduled date must be in the future');
        return;
      }
    }

    setIsPublishing(true);
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      // Add image file if selected
      if (coverImageFile) {
        formData.append('image', coverImageFile);
      }
      
      // Add other form fields
      formData.append('title', title.trim());
      formData.append('tags', JSON.stringify(tags));
      formData.append('price', tier === 'paid' ? price.toString() : '0');
      formData.append('html_content', content);
      formData.append('allow_comments', allowComments.toString());
      formData.append('tier', tier);
      formData.append('collection', collection);
      formData.append('attachments', JSON.stringify(attachmentPreviews));
      formData.append('date_published', isScheduled ? `${scheduledDate}T${scheduledTime}` : new Date().toISOString());
      formData.append('scheduled_time', isScheduled ? `${scheduledDate}T${scheduledTime}` : new Date().toISOString());

      // Get the access token from localStorage
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }

      const response = await fetch(`${env.BACKEND_URL}/posts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // Don't set Content-Type header - let browser set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access forbidden. Your session may have expired. Please log in again.');
        } else if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Post published successfully:', result);
      
      if (isScheduled) {
        alert(`Post scheduled successfully! It will be published on ${formatScheduledDate()}`);
      } else {
        alert('Post published successfully!');
      }
      
      // Redirect to home page after successful publishing
      router.push('/clinician/home');
      
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Failed to publish post. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-screen bg-d">
      {/* Sidebar */}
      <ClinicianSidebar />
      
      {/* Main Content */}
      <div className="ml-64 h-full bg-d flex">
        {/* Column B - Main Content */}
        <div className="w-4/5 p-6 bg-d">
          <div className="bg-white rounded-xl  ">
            {/* Page Title */}
            {isEditingDraft && (
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Edit Draft</h1>
              </div>
            )}
            {/* Cover Image Section */}
            <div className="p-6 border-1 rounded-md border-gray-200">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cover Image</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload a cover image for your post (JPG, JPEG, PNG, GIF)
                  </p>
                </div>
                
                {/* Cover Image Upload */}
                <div className="space-y-3">
                  <input
                    type="file"
                    id="coverImageFile"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCoverImageFile(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setCoverImagePreview(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => document.getElementById('coverImageFile')?.click()}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {coverImageFile ? 'Change Cover Image' : 'Click to upload cover image'}
                  </button>
                  
                  {/* Cover Image Preview */}
                  {coverImagePreview && (
                    <div className="relative">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setCoverImageFile(null);
                          setCoverImagePreview('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="p-6 border-1 rounded-md border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                  <p className="text-sm text-gray-500">
                    Upload additional files (JPG, JPEG, PNG, PDF, GIF Max 2GB)
                  </p>
                </div>
                <button 
                  onClick={() => document.getElementById('attachmentFiles')?.click()}
                  className="font-bold text-gray-900 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors border border-gray-300"
                >
                  Upload
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Attachments Upload */}
                <div className="space-y-3">
                  <div>
                    <input
                      type="file"
                      id="attachmentFiles"
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setAttachmentFiles(prev => [...prev, ...files]);
                        
                        // Create previews for new files
                        files.forEach(file => {
                          if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setAttachmentPreviews(prev => [...prev, e.target?.result as string]);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setAttachmentPreviews(prev => [...prev, file.name]);
                          }
                        });
                      }}
                      className="hidden"
                    />
                   
                  </div>
                  
                  {/* Attachment Previews */}
                  {attachmentPreviews.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Attachments:</h4>
                      {attachmentPreviews.map((preview, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            {preview.startsWith('data:') ? (
                              <img src={preview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                            ) : preview.startsWith('http') ? (
                              <img src={preview} alt="Image" className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">📎</span>
                              </div>
                            )}
                            <span className="text-sm text-gray-700">
                              {preview.startsWith('data:') ? `File ${index + 1}` : 
                               preview.startsWith('http') ? `Image ${index + 1}` : preview}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
                              setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className="py-6  ">
              {isTitleEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  className="text-3xl font-bold text-gray-900 w-full border-none outline-none focus:ring-0"
                  autoFocus
                />
              ) : (
                <h1 
                  onClick={handleTitleClick}
                  className="text-3xl font-bold text-b cursor-pointer hover:bg-gray-50 py-2 rounded transition-colors"
                >
                  {title}
                </h1>
              )}
            </div>

            {/* Tiptap Rich Text Editor */}
            <div className="py-6 text-black">
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing your post content here..."
              />
            </div>
          </div>
        </div>

        {/* Column C - Publishing Controls */}
        <div className="w-2/5 p-6">
          <div className="bg-white rounded-xl  h-full   space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-row space-x-3 w-full">
              <button 
                onClick={handleSaveDraft}
                disabled={isSaving || isPublishing}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                onClick={handlePublish}
                disabled={isSaving || isPublishing}
                className="flex-1 bg-a text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>

            {/* Tier Access */}
            <div className="space-y-3 border-1 rounded-xl p-3">
              <h3 className="text-lg font-semibold  text-gray-900">Tier Access</h3>
              
                             {/* Public Option */}
               <div className="flex items-start space-x-3">
                 <input
                   type="radio"
                   name="tier"
                   id="public"
                   value="public"
                   checked={tier === 'public'}
                   onChange={(e) => setTier(e.target.value)}
                   className="mt-1"
                 />
                 <div>
                   <label htmlFor="public" className="text-sm font-medium text-gray-900">
                     Public
                   </label>
                   <p className="text-xs text-gray-500">Anyone can view this article</p>
                 </div>
               </div>

               {/* Paid Option */}
               <div className="flex items-start space-x-3 ">
                 <input
                   type="radio"
                   name="tier"
                   id="paid"
                   value="paid"
                   checked={tier === 'paid'}
                   onChange={(e) => setTier(e.target.value)}
                   className="mt-1"
                 />
                 <label htmlFor="paid" className="text-sm font-medium text-gray-900">
                   Paid
                 </label>
                 <div className="flex flex-row items-center space-x-1 ml-auto">
                   <span className="text-gray-500">$</span>
                   <input
                     type="number"
                     placeholder="0.00"
                     value={price}
                     onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                     className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-black focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                   />
                 </div>
               </div>
            </div>

                         {/* Allow Comments */}
             <div className="flex items-center justify-between border-1 rounded-xl p-3">
               <span className="text-sm font-medium text-gray-900">Allow Comments</span>
               <button 
                 onClick={() => setAllowComments(!allowComments)}
                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-b focus:ring-offset-2 ${
                   allowComments ? 'bg-a' : 'bg-gray-200'
                 }`}
               >
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                   allowComments ? 'translate-x-6' : 'translate-x-1'
                 }`}></span>
               </button>
             </div>

            {/* Schedule Release */}
            <div className="space-y-3 border-1 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Schedule Release</span>
                <button 
                  onClick={handleScheduleToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-b focus:ring-offset-2 ${
                    isScheduled ? 'bg-a' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isScheduled ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
              
                             {/* Inline Date and Time Pickers */}
               {isScheduled && (
                 <div className="space-y-3">
                   {/* Date Picker Row */}
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">Date</label>
                     <div className="flex items-center space-x-2">
                       <input
                         type="date"
                         value={scheduledDate}
                         onChange={(e) => setScheduledDate(e.target.value)}
                         min={new Date().toISOString().split('T')[0]}
                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       />
                     </div>
                   </div>
                   
                   {/* Time Picker Row */}
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">Time</label>
                     <div className="flex items-center space-x-2">
                       <input
                         type="time"
                         value={scheduledTime}
                         onChange={(e) => setScheduledTime(e.target.value)}
                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       />
                     </div>
                   </div>
                   
                 </div>
               )}
            </div>

            {/* Collections */}
             <div className="space-y-3 border-1 rounded-xl p-3">
               <div>
                 <h3 className="text-sm font-semibold text-gray-900">Collections</h3>
                 <p className="text-xs text-gray-500">Help fans explore your work with collections of related posts</p>
               </div>
               
               {/* Custom Collections Dropdown */}
               <div className="relative collections-dropdown">
                 <button
                   type="button"
                   onClick={() => setIsCollectionsDropdownOpen(!isCollectionsDropdownOpen)}
                   className="w-full px-3 py-2 text-left border-1 text-b border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent bg-white relative"
                 >
                   <div
                     className={`inline-block ${
                       collection
                         ? 'border-1 border-b rounded px-2 py-0.5'
                         : ''
                     }`}
                   >
                     {collection || 'Select a collection'}
                   </div>
                   <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </span>
                 </button>
                 {/* Dropdown Content */}
                 {isCollectionsDropdownOpen && (
                   <div className="absolute z-10 w-full mt-1 rounded-b-xl bg-white border text-black border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                     {isLoadingCollections ? (
                       <div className="px-3 py-2 text-sm text-gray-500 text-center">Loading collections...</div>
                     ) : collections.length > 0 ? (
                       <>
                         {collections.map((col) => (
                           <div key={col.collection_id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                             <input
                               type="radio"
                               name="collection"
                               id={`collection-${col.collection_id}`}
                               value={col.name}
                               checked={collection === col.name}
                               onChange={(e) => {
                                 setCollection(e.target.value);
                                 setIsCollectionsDropdownOpen(false);
                               }}
                               className="mr-3 bg-b"
                             />
                             <label 
                               htmlFor={`collection-${col.collection_id}`}
                               className="text-sm text-gray-700 cursor-pointer flex-1"
                             >
                               {col.name}
                             </label>
                           </div>
                         ))}
                         <div className=" border-gray-200 p-4">
                           <button
                             type="button"
                             onClick={() => {
                               setIsCollectionsDropdownOpen(false);
                               setIsCreateCollectionModalOpen(true);
                             }}
                             className="w-full items-center justify-center px-3 py-2 text-sm text-b hover:bg-blue-50 text-left font-bold rounded-full border-1"
                           >
                             + Create collection
                           </button>
                         </div>
                       </>
                     ) : (
                       <div className="px-3 py-2 text-sm text-black text-center">
                         No collections found
                         <div className="mt-1">
                           <button
                             type="button"
                             onClick={() => {
                               setIsCollectionsDropdownOpen(false);
                               setIsCreateCollectionModalOpen(true);
                             }}
                             className="text-b rounded-full py-1 px-4 w-full border-1 border-b my-2 font-bold"
                           >
                             +   Create your first collection
                           </button>
                         </div>
                       </div>
                     )}
                   </div>
                 )}
               </div>
             </div>

                         {/* Tags */}
             <div className="space-y-3 border-1 rounded-xl p-3">
               <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
               <div className="space-y-2">
                 <div className="flex flex-wrap gap-2">
                   {tags.map((tag, index) => (
                     <span key={index} className="inline-flex items-center px-2 py-1 rounded-2xl text-xs font-medium border-1 border-gray-300 text-black">
                       {tag}
                       <button
                         type="button"
                         onClick={() => setTags(tags.filter((_, i) => i !== index))}
                         className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                       >
                         ×
                       </button>
                     </span>
                   ))}
                 </div>
                 <select 
                   onChange={(e) => {
                     if (e.target.value && !tags.includes(e.target.value)) {
                       setTags([...tags, e.target.value]);
                       e.target.value = '';
                     }
                   }}
                   className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                 >
                   <option value="">Add a tag</option>
                   <option value="autism">Autism</option>
                   <option value="speech-therapy">Speech Therapy</option>
                   <option value="behavioral">Behavioral</option>
                   <option value="occupational-therapy">Occupational Therapy</option>
                   <option value="sensory">Sensory</option>
                   <option value="communication">Communication</option>
                   <option value="parenting">Parenting</option>
                   <option value="physical-therapy">Physical Therapy</option>
                   <option value="development">Development</option>
                   <option value="intervention">Intervention</option>
                   <option value="therapy">Therapy</option>
                 </select>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Create Collection Modal */}
      {isCreateCollectionModalOpen && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-b">Create collection</h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateCollectionModalOpen(false);
                  setNewCollectionName('');
                }}
                className="text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-900 mb-4">
              Once a collection is created, you can begin to add items to it
            </p>

            {/* Input Box with Arrow inside the textbox */}
            <div className="relative">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="w-full pr-10 px-3 py-2 border text-gray-900 border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCollectionName.trim()) {
                    createCollection(newCollectionName.trim());
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newCollectionName.trim()) {
                    createCollection(newCollectionName.trim());
                  }
                }}
                disabled={!newCollectionName.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent text-b rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ height: '36px', width: '36px' }}
                tabIndex={-1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
} 