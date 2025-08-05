'use client';

import { useState } from 'react';
import ClinicianSidebar from '../../sidebar';

export default function CreatePostPage() {
  const [title, setTitle] = useState('Title goes here');
  const [content, setContent] = useState('');
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  const handleTitleClick = () => {
    setIsTitleEditing(true);
  };

  const handleTitleBlur = () => {
    setIsTitleEditing(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
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

            {/* Rich Text Editor Toolbar */}
            <div className="p-1 border-1 rounded-md border-gray-200">
              <div className="flex justify-between items-center">
                {/* Left side - Text formatting */}
                <div className="flex items-center space-x-4">
                  {/* Text selection box */}
                  <select className=" text-gray-900 rounded px-3 py-1 text-sm">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                    <option>Heading 3</option>
                  </select>

                  {/* Division 1 - Text formatting buttons */}
                  <div className="flex items-center space-x-1 text-gray-900">
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Bold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Italic">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Underline">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Strikethrough">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                    </button>
                  </div>

                  {/* Division 2 - List buttons */} 
                  <div className="flex items-center space-x-1 text-gray-900">
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Bullet List">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Numbered List">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right side - Additional buttons */}
                <div className="flex items-center space-x-1 text-gray-900">
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Link">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Media">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Quote">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Text Area */}
            <div className="py-6 flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your post content here..."
                className="w-full h-96 border-none outline-none resize-none text-gray-900 placeholder-gray-400 focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Column C - Publishing Controls */}
        <div className="w-2/5 p-6">
          <div className="bg-white rounded-xl  h-full   space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-row space-x-3 w-full">
              <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Save Draft
              </button>
              <button className="flex-1 bg-a text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium">
                Publish
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