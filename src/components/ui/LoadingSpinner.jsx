import React from 'react';
import { Loader2 } from 'lucide-react';

// Loading Spinner Component
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-[#C15F3C]',
    white: 'text-white',
    gray: 'text-gray-600',
    blue: 'text-blue-600',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} 
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 text-center">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Progress Bar Component
export const ProgressBar = ({ 
  progress = 0, 
  text = '', 
  showPercentage = true,
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {text && (
        <p className="text-sm text-gray-600 mb-2">{text}</p>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-gray-500 mt-1 text-right">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
};

// Skeleton Loading Component
export const Skeleton = ({ 
  type = 'text', 
  lines = 1, 
  className = '' 
}) => {
  const skeletonClasses = {
    text: 'h-4 bg-gray-200 rounded',
    title: 'h-6 bg-gray-200 rounded',
    image: 'w-full h-48 bg-gray-200 rounded-lg',
    button: 'h-10 bg-gray-200 rounded-lg',
    card: 'w-full h-32 bg-gray-200 rounded-lg',
  };

  if (type === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index} 
            className={`${skeletonClasses[type]} animate-pulse`}
            style={{ 
              width: index === lines - 1 ? '60%' : '100%' 
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${skeletonClasses[type]} animate-pulse ${className}`}
    />
  );
};

// Loading States for different scenarios
export const LoadingStates = {
  // Page loading
  Page: () => (
    <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">
      <LoadingSpinner size="xl" text="Loading..." />
    </div>
  ),

  // Component loading
  Component: ({ text = 'Loading...' }) => (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="lg" text={text} />
    </div>
  ),

  // Button loading
  Button: ({ text = 'Loading...' }) => (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="sm" color="white" />
      <span>{text}</span>
    </div>
  ),

  // Image loading
  Image: () => (
    <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
      <LoadingSpinner size="md" text="Loading image..." />
    </div>
  ),

  // Generation loading
  Generation: ({ progress = 0 }) => (
    <div className="space-y-4">
      <ProgressBar 
        progress={progress} 
        text="Generating your image..." 
        showPercentage={true}
      />
      <p className="text-sm text-gray-500 text-center">
        This may take a few moments...
      </p>
    </div>
  ),
};

export default LoadingSpinner;

