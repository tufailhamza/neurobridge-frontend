'use client';

import { useState, useEffect } from 'react';
import ClinicianSidebar from '../sidebar';
import { useRouter } from 'next/navigation';
import { Post } from '@/types/Post';
import { Collection } from '@/types/Collection';
import { env } from '@/config/env';

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);
  const postsPerPage = 200;

  const tabs = [
    { id: 'published', label: 'Published Posts' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'draft', label: 'Draft' },
    { id: 'collections', label: 'Collections' }
  ];

  // Load drafts from localStorage
  const loadDrafts = () => {
    try {
      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        const storedDrafts = JSON.parse(localStorage.getItem('clinician_drafts') || '[]');
        // Filter drafts for current user
        const userDrafts = storedDrafts.filter((draft: any) => draft.user_id === user.user_id);
        setDrafts(userDrafts);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
      setDrafts([]);
    }
  };

  // Fetch collections from backend API
  const fetchUserCollections = async () => {
    try {
      setCollectionsLoading(true);
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userInfo);
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${env.BACKEND_URL}/collections/user/${user.user_id}`, {
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
          throw new Error(`Failed to fetch collections: ${response.status}`);
        }
      }

      const data = await response.json();
      setCollections(data || []);
    } catch (err) {
      console.error('Error fetching user collections:', err);
      // Don't set error for collections as it's not critical
      setCollections([]);
    } finally {
      setCollectionsLoading(false);
    }
  };

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

        console.log('Fetching posts for user:', user.user_id);
        console.log('Backend URL:', env.BACKEND_URL);
        
        const apiUrl = `${env.BACKEND_URL}/posts/user/${user.user_id}?skip=${(currentPage - 1) * postsPerPage}&limit=${postsPerPage}`;
        console.log('API URL:', apiUrl);

        // Fetch posts for the current user
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized. Please log in again.');
          } else if (response.status === 403) {
            throw new Error('Access forbidden. Please check your permissions.');
          } else if (response.status === 404) {
            // No posts found - this is not an error, just empty state
            console.log('No posts found (404)');
            setPosts([]);
            return;
          } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch posts: ${response.status} - ${errorText}`);
          }
        }

        const data = await response.json();
        console.log('Posts data received:', data);
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Test backend connection first
    const testBackend = async () => {
      try {
        const testResponse = await fetch(`${env.BACKEND_URL}/posts/test`);
        console.log('Backend test response:', testResponse.status);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('Backend test data:', testData);
        }
      } catch (error) {
        console.error('Backend test failed:', error);
      }
    };
    
    testBackend();
    fetchUserPosts();
    loadDrafts(); // Load drafts when component mounts
    fetchUserCollections(); // Load collections when component mounts
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.actions-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCreateCollectionModalOpen && !creatingCollection) {
        setIsCreateCollectionModalOpen(false);
        setNewCollectionName('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isCreateCollectionModalOpen, creatingCollection]);

  // Function to refresh drafts
  const refreshDrafts = () => {
    loadDrafts();
  };

  // Function to delete a draft
  const deleteDraft = (draftId: number) => {
    try {
      const storedDrafts = JSON.parse(localStorage.getItem('clinician_drafts') || '[]');
      const updatedDrafts = storedDrafts.filter((draft: any) => draft.id !== draftId);
      localStorage.setItem('clinician_drafts', JSON.stringify(updatedDrafts));
      loadDrafts(); // Refresh the drafts list
      // setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting draft:', error);
      setError('Failed to delete draft');
    }
  };

  // Function to create a new collection
  const createCollection = async (name: string) => {
    try {
      setCreatingCollection(true);
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userInfo);
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${env.BACKEND_URL}/collections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          user_id: user.user_id
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Please check your permissions.');
        } else {
          throw new Error(`Failed to create collection: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Close modal and reset form
      setIsCreateCollectionModalOpen(false);
      setNewCollectionName('');
      
      // Refresh collections list
      await fetchUserCollections();
      // setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error creating collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setCreatingCollection(false);
    }
  };

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
        } else if (response.status === 404) {
          // No posts found - this is not an error, just empty state
          setPosts([]);
          return;
        } else {
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }
      }

      const data = await response.json();
      setPosts(data || []);
      loadDrafts(); // Also refresh drafts
      fetchUserCollections(); // Also refresh collections
      // setTimeout(() => setSuccessMessage(null), 5000); // Clear message after 5 seconds
    } catch (err) {
      console.error('Error refreshing posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh posts');
    } finally {
      setRefreshing(false);
    }
  };

  // Filter posts or drafts based on active tab and search query
  const getFilteredItems = () => {
    let items = activeTab === 'draft' ? drafts : activeTab === 'collections' ? collections : posts;
    return items.filter(item => {
      if (activeTab === 'collections') {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      } else {
        return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.collection && item.collection.toLowerCase().includes(searchQuery.toLowerCase()));
      }
    });
  };

  const filteredItems = getFilteredItems();

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / postsPerPage);
  const currentItems = filteredItems.slice(0, postsPerPage);

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
              {activeTab === 'collections' ? (
                <button 
                  onClick={() => setIsCreateCollectionModalOpen(true)}
                  className="bg-a text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                  <span>+  Create Collection</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={refreshPosts}
                    disabled={refreshing}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 hover:bg-gray-200 disabled:opacity-50"
                  >
                    {refreshing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    <span>Refresh</span>
                  </button>
                  <button 
                    onClick={() => router.push('/clinician/library/create-post')}
                    className="bg-a text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                    <span>+  Create Post</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mx-6 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

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
                    placeholder={activeTab === 'draft' ? 'Search drafts...' : activeTab === 'collections' ? 'Search collections...' : 'Search posts...'}
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
              {!loading && (activeTab === 'draft' ? drafts.length > 0 : activeTab === 'collections' ? collections.length > 0 : posts.length > 0) && (
                <span className="text-sm text-gray-500">
                  {filteredItems.length} {activeTab === 'draft' ? 'draft' : activeTab === 'collections' ? 'collection' : 'post'}{filteredItems.length !== 1 ? 's' : ''} found
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
            {loading || (activeTab === 'collections' && collectionsLoading) ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    {activeTab === 'collections' ? 'Loading collections...' : 'Loading posts...'}
                  </p>
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
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {searchQuery ? `No ${activeTab === 'draft' ? 'drafts' : activeTab === 'collections' ? 'collections' : 'posts'} found matching your search.` : `No ${activeTab === 'draft' ? 'drafts' : activeTab === 'collections' ? 'collections' : 'posts'} found.`}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => activeTab === 'collections' ? setIsCreateCollectionModalOpen(true) : router.push('/clinician/library/create-post')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {activeTab === 'draft' ? 'Create Your First Draft' : activeTab === 'collections' ? 'Create Your First Collection' : 'Create Your First Post'}
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="">
                  {activeTab === 'collections' && (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Number of Items
                          </th>
                          <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item: Collection) => (
                          <tr key={item.collection_id} className="hover:bg-gray-50">
                            <td className="py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{item.post_count || 0}</div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatDate(item.created_at)}
                              </div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <div className="relative actions-dropdown">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === item.collection_id ? null : item.collection_id)}
                                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>
                                
                                {openDropdown === item.collection_id && (
                                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                    <button
                                      onClick={() => {
                                        router.push(`/clinician/library/collections/${item.collection_id}`);
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md"
                                    >
                                      View Items
                                    </button>
                                    <button
                                      onClick={() => {
                                        router.push(`/clinician/library/create-collection?collectionId=${item.collection_id}`);
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        // TODO: Implement delete collection logic
                                        console.log('Delete collection:', item.collection_id);
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 last:rounded-b-md"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {activeTab !== 'collections' && (
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
                            {activeTab === 'draft' ? 'Date Created' : 'Date Published'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item: any) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{item.collection || '-'}</div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-gray-600">
                                {item.tier || item.access || 'public'}
                              </span>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatPrice(item.price)}</div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {activeTab === 'draft' 
                                  ? formatDate(item.date_created) 
                                  : formatDate(item.date_published)
                                }
                              </div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <div className="relative actions-dropdown">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>
                                
                                {openDropdown === item.id && (
                                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                    {activeTab === 'draft' && (
                                      <>
                                        <button
                                          onClick={() => {
                                            router.push(`/clinician/library/create-post?draft=${item.id}`);
                                            setOpenDropdown(null);
                                          }}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => {
                                            deleteDraft(item.id);
                                            setOpenDropdown(null);
                                          }}
                                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 last:rounded-b-md"
                                        >
                                          Delete
                                        </button>
                                      </>
                                    )}
                                    {activeTab !== 'draft' && (
                                      <div className="px-4 py-2 text-sm text-gray-500">
                                        No actions
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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

      {/* Create Collection Modal */}
      {isCreateCollectionModalOpen && (
        <div 
          className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creatingCollection) {
              setIsCreateCollectionModalOpen(false);
              setNewCollectionName('');
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create collection</h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateCollectionModalOpen(false);
                  setNewCollectionName('');
                }}
                className="text-gray-900 transition-colors"
                disabled={creatingCollection}
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

            {/* Input Box with Arrow */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="flex-1 px-3 py-2 border text-gray-900 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-b focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCollectionName.trim() && !creatingCollection) {
                    createCollection(newCollectionName.trim());
                  }
                }}
                disabled={creatingCollection}
              />
              <button
                type="button"
                onClick={() => {
                  if (newCollectionName.trim() && !creatingCollection) {
                    createCollection(newCollectionName.trim());
                  }
                }}
                disabled={!newCollectionName.trim() || creatingCollection}
                className="px-3 py-2 bg-b text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingCollection ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 