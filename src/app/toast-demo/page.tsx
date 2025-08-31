'use client';

import { ToastDemo } from '@/components/ToastDemo';

export default function ToastDemoPage() {
  return (
    <div className="min-h-screen bg-d p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-b mb-8">Toast System Demo</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates the toast notification system. Click the buttons below to see different types of toasts in action.
        </p>
        
        <ToastDemo />
        
      </div>
    </div>
  );
}
