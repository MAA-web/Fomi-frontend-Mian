"use client";

import React from 'react';
import useAuth from '@/lib/hooks/useAuth';

const LoginStatusIndicator = ({ showDetails = false }) => {
  const { user, isAuthenticated, isLoading, userCredits } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Not logged in</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-sm text-gray-600">Logged in</span>
      
      {showDetails && user && (
        <div className="ml-2 text-xs text-gray-500">
          • {user.name || user.email} • {userCredits || 0} credits
        </div>
      )}
    </div>
  );
};

export default LoginStatusIndicator;
