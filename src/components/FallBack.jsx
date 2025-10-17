"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const FallBack = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 bg-[#f9f3f0] flex items-center justify-center z-50">
      <div className="bg-[#f9f3f0] rounded-lg p-8 max-w-md mx-4 shadow-xl border border-amber-200">
        <div className="text-center">
          <div className="mb-4">
            <svg 
              className="mx-auto h-25 w-25 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-black mb-6">
            Service Unavailable
          </h2>
          <p className="text-black mb-6">
            The service is currently unavailable! Please try again later.
          </p>
          <button 
            onClick={handleGoBack}
            className="bg-emerald-400 hover:bg-emerald-500 text-white font-medium py-2 px-6 rounded-full transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FallBack;
