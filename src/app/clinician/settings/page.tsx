'use client';

import { useState } from 'react';
import ClinicianSidebar from '../sidebar';

export default function ClinicianSettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  const handleDeleteAccount = () => {
    // Add confirmation dialog and delete logic here
    if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      console.log('Deleting account...');
      // Add actual delete logic here
    }
  };

  return (
    <div className="h-screen bg-d">
      {/* Sidebar */}
      <ClinicianSidebar />
      
      {/* Main Content */}
      <div className="ml-64 flex bg-d">
        <div className="w-full p-6 bg-d">
          <div className="max-w-4xl">
            
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-b">Settings</h1>
            </div>

            {/* Tab Bar */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'account'
                        ? 'border-b text-b'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Account
                  </button>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'payment'
                        ? 'border-b text-b'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Payment Method
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg   border-gray-200">
              {activeTab === 'account' && (
                <div className="p-6 border rounded-xl">
                  {/* Delete Account Row */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-b">Delete Account</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        This will permanently delete your account and all content that was created
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="ml-4 px-4 py-2 border-2 border-b text-b  font-semibold rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="">
                {/* Delete Account Row */}
                <div className="flex items-center justify-between p-4 border rounded-xl border-gray-100">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-b">Add Card</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      To purchase content youll need to add a debit or credit card.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="ml-4 px-5 py-2 bg-a text-white   font-semibold rounded-lg"
                  >
                    Connect
                  </button>
                </div>
                  {/* Delete Account Row */}
                  <div className="flex items-center justify-between p-4 border rounded-xl border-gray-100 mt-8">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-b">Delete Account</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        To recieve payouts for your content please link a bank account
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="ml-4 px-5 py-2 bg-a text-white   font-semibold rounded-lg"
                    >
                      Connect
                    </button>
                </div>
              </div>
              
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 