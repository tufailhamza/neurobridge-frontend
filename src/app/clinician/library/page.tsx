'use client';

import { useState } from 'react';
import ClinicianSidebar from '../sidebar';
import { useRouter } from 'next/navigation';

// Mock data for the table
const mockPosts = [
  {
    id: 1,
    title: "Understanding Autism Spectrum Disorder",
    collection: "Autism Resources",
    access: "paid",
    price: 29.99,
    datePublished: "2024-01-15"
  },
  {
    id: 2,
    title: "Behavioral Intervention Strategies",
    collection: "-",
    access: "public",
    price: 0,
    datePublished: "2024-01-10"
  },
  {
    id: 3,
    title: "Speech Therapy Techniques for Children",
    collection: "Speech Development",
    access: "paid",
    price: 19.99,
    datePublished: "2024-01-08"
  },
  {
    id: 4,
    title: "Occupational Therapy Activities",
    collection: "OT Resources",
    access: "paid",
    price: 24.99,
    datePublished: "2024-01-05"
  },
  {
    id: 5,
    title: "Parenting Tips for Special Needs",
    collection: "-",
    access: "public",
    price: 0,
    datePublished: "2024-01-03"
  },
  {
    id: 6,
    title: "Sensory Processing Disorder Guide",
    collection: "Sensory Resources",
    access: "paid",
    price: 34.99,
    datePublished: "2024-01-01"
  },
  {
    id: 7,
    title: "Communication Tools for Non-Verbal Children",
    collection: "Communication",
    access: "paid",
    price: 39.99,
    datePublished: "2023-12-28"
  },
  {
    id: 8,
    title: "Physical Therapy Exercises",
    collection: "-",
    access: "public",
    price: 0,
    datePublished: "2023-12-25"
  }
];

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const tabs = [
    { id: 'published', label: 'Published Posts' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'draft', label: 'Draft' },
    { id: 'collections', label: 'Collections' }
  ];

  // Filter posts based on search query
  const filteredPosts = mockPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.collection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  return (
    <div className="h-screen bg-d">
      {/* Sidebar */}
      <ClinicianSidebar />
      
      {/* Main Content */}
      <div className="ml-64 h-full p-6">
        <div className="bg-white ">
          {/* Header */}
          <div className="flex justify-between items-center  border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Library</h1>
            <button 
            onClick={() => router.push('/clinician/library/create-post')}
            className="bg-a text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Post</span>
            </button>
          </div>

          {/* Tab Bar */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 ">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-b text-b'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filter Row */}
          <div className="flex justify-between items-center py-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-b pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <button className="bg-white border text-b border-b px-4 py-2 rounded-full hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <span>Tier</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Published
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className=" py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    </td>
                    <td className=" py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{post.collection}</div>
                    </td>
                    <td className=" py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-gray-500`}>
                        {post.access}
                      </span>
                    </td>
                    <td className=" py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(post.price)}</div>
                    </td>
                    <td className=" py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(post.datePublished)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center py-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-1 py-2 text-sm font-medium text-gray-500 bg-white  "
                aria-label="Previous Page"
              >
                &lt;
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-1 py-2 text-sm font-medium  ${
                    currentPage === page
                      ? ' text-b'
                      : 'text-b'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-1 py-2 text-sm font-medium text-gray-500 "
                aria-label="Next Page"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 