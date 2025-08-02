'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CaregiverSidebar from '../sidebar';

export default function CaregiverProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-d">
      {/* Sidebar */}
      <CaregiverSidebar />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="w-full">
          {/* Two Column Layout */}
          <div className="grid grid-cols-5 gap-8 w-full">
            {/* Column B - Weight 3 */}
            <div className="col-span-3 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-b mb-4">Column B</h2>
              <p className="text-gray-600">
                This is column B with weight 3. It takes up 3/5 of the total width.
              </p>
            </div>

            {/* Column C - Weight 2 */}
            <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-b mb-4">Column C</h2>
              <p className="text-gray-600">
                This is column C with weight 2. It takes up 2/5 of the total width.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
