'use client';

import { useState, useEffect } from 'react';
import ClinicianSidebar from '../sidebar';
import { useRouter } from 'next/navigation';
import { Post } from '@/types/Post';
import { env } from '@/config/env';

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const postsPerPage = 200;

  const tabs = [
    { id: 'published', label: 'Published Posts' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'draft', label: 'Draft' },
    { id: 'collections', label: 'Collections' }
  ];

  // Fetch posts from backend API
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user info from localStorage
        const userInfo = localStorage.getItem('user_info');
        if (!userInfo) {
          throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userInfo);
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Fetch posts for the current user
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/user/${user.user_id}?skip=${(currentPage - 1) * postsPerPage}&limit=${postsPerPage}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized. Please log in again.');
          } else if (response.status === 403) {
            throw new Error('Access forbidden. Please check your permissions.');
          } else {
            throw new Error(`Failed to fetch posts: ${response.status}`);
          }
        }

        const data = await response.json();
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [currentPage]);

  // Auto-refresh posts when user returns to the page (useful after creating posts)
  useEffect(() => {
    const handleFocus = () => {
      // Only refresh if we're not already loading and have posts
      if (!loading && posts.length > 0) {
        refreshPosts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loading, posts.length]);

  // Function to refresh posts (useful after creating new posts)
  const refreshPosts = async () => {
    try {
      setRefreshing(true);
      setError(null);
      setCurrentPage(1);
      setSearchQuery('');
      
      // Get user info from localStorage
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userInfo);
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Fetch posts for the current user
      const response = await fetch(`${env.BACKEND_URL}/posts/user/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Please check your permissions.');
        } else {
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }
      }

      const data = await response.json();
      setPosts(data || []);
      setSuccessMessage('Posts refreshed successfully!');
      setTimeout(() => setSuccessMessage(null), 5000); // Clear message after 5 seconds
    } catch (err) {
      console.error('Error refreshing posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh posts');
    } finally {
      setRefreshing(false);
    }
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.collection && post.collection.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(0, postsPerPage);

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

  const handleRetry = () => {
    setCurrentPage(1);
    setError(null);
  };

  return (
    <div className="h-screen bg-d">
      {/* Sidebar */}
      <ClinicianSidebar />
      
      {/* Main Content */}
      <div className="ml-64 h-full p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center p-6  border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Library</h1>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/clinician/library/create-post')}
                className="bg-a text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <span>+  Create Post</span>
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6 font-bold">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pt-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-b text-b font-bold'
                      : 'border-transparent font-bold text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filter Row */}
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-gray-900 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {!loading && posts.length > 0 && (
                <span className="text-sm text-gray-500">
                  {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            <button className="bg-white border text-gray-700 border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <span>Tier</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading posts...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={handleRetry} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {searchQuery ? 'No posts found matching your search.' : 'No posts found.'}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => router.push('/clinician/library/create-post')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            ) : (
              <>
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
                          Tier Access
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
                          <td className="py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{post.collection || '-'}</div>
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              post.access === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {post.access}
                            </span>
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatPrice(post.price)}</div>
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(post.date_published)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-end items-center py-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous Page"
                      >
                        &lt;
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next Page"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 