'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ClinicianSidebar from '../../sidebar';

// Dynamically import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="w-full h-96 text-black bg-gray-100 rounded-md animate-pulse flex items-center justify-center">Loading editor...</div>
});

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('Title goes here');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [price, setPrice] = useState(0);
  const [allowComments, setAllowComments] = useState(true);
  const [tier, setTier] = useState('public');
  const [collection, setCollection] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    
    if (!accessToken) {
      alert('Please log in to create a post');
      router.push('/login');
      return;
    }

  }, [router]);

  const handleTitleClick = () => {
    setIsTitleEditing(true);
  };

  const handleTitleBlur = () => {
    setIsTitleEditing(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save to your backend
      console.log('Saving draft:', { title, content });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Draft saved successfully!');
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

    setIsPublishing(true);
    try {
      const postData = {
        image_url: coverImageUrl,
        title: title.trim(),
        tags: tags,
        price: tier === 'paid' ? price : 0,
        html_content: content,
        allow_comments: allowComments,
        tier: tier,
        collection: collection,
        attachments: attachments,
        date_published: new Date().toISOString()
      };

      // Get the access token from localStorage
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(postData),
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
      alert('Post published successfully!');
      
      // Clear form or redirect to published post
      // You can add navigation logic here
      
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
            {/* Attachments Section */}
            <div className="p-6 border-1 rounded-md border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                  <p className="text-sm text-gray-500">
                    Recommended size 1024x1024 JPG, JPEG, PNG, PDF or GIF Max 2GB
                  </p>
                </div>
                <button className=" text-gray-900 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                  Upload
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <input
                    type="url"
                    id="coverImageUrl"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="Enter your cover image URL"
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                     className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
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
                   allowComments ? 'bg-blue-600' : 'bg-gray-200'
                 }`}
               >
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                   allowComments ? 'translate-x-6' : 'translate-x-1'
                 }`}></span>
               </button>
             </div>

            {/* Schedule Release */}
            <div className="flex items-center justify-between border-1 rounded-xl p-3">
              <span className="text-sm font-medium text-gray-900">Schedule Release</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-b focus:ring-offset-2">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
              </button>
            </div>

            {/* Collections */}
            <div className="space-y-3 border-1 rounded-xl p-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Collections</h3>
                <p className="text-xs text-gray-500">Help fans explore your work with collections of related posts</p>
              </div>
                             <select 
                 value={collection}
                 onChange={(e) => setCollection(e.target.value)}
                 className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
               >
                 <option value="">Select a collection</option>
                 <option value="autism-resources">Autism Resources</option>
                 <option value="speech-development">Speech Development</option>
                 <option value="behavioral-intervention">Behavioral Intervention</option>
                 <option value="occupational-therapy">Occupational Therapy</option>
                 <option value="sensory-processing">Sensory Processing</option>
                 <option value="communication-tools">Communication Tools</option>
                 <option value="parenting-tips">Parenting Tips</option>
                 <option value="physical-therapy">Physical Therapy</option>
               </select>
            </div>

                         {/* Tags */}
             <div className="space-y-3 border-1 rounded-xl p-3">
               <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
               <div className="space-y-2">
                 <div className="flex flex-wrap gap-2">
                   {tags.map((tag, index) => (
                     <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
    </div>
  );
} 