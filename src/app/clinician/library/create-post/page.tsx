'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ClinicianSidebar from '../../sidebar';

// Dynamically import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">Loading editor...</div>
});

export default function CreatePostPage() {
  const [title, setTitle] = useState('Title goes here');
  const [content, setContent] = useState('');
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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
      // Here you would typically publish to your backend
      console.log('Publishing post:', { title, content });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Post published successfully!');
      // You could redirect to the published post or clear the form
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Failed to publish post');
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
              <div className="flex justify-between items-start">
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
            <div className="py-6">
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
                  className="mt-1"
                  defaultChecked
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
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Allow Comments */}
            <div className="flex items-center justify-between border-1 rounded-xl p-3">
              <span className="text-sm font-medium text-gray-900">Allow Comments</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-b focus:ring-offset-2">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
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
              <select className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent">
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
              <select className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent">
                <option value="">Select tags</option>
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
  );
} 