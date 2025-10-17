'use client';

import { useState, useEffect } from 'react';
import { Coins, AlertCircle, RefreshCw } from 'lucide-react';
import creditsService from '../../lib/services/creditsService';

export default function CreditsDisplay({ 
  firebaseId = null,
  showRefreshButton = false,
  className = "",
  size = "default" // "small", "default", "large"
}) {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Size configurations
  const sizeConfig = {
    small: {
      container: "px-2 py-1 text-xs",
      icon: "w-3 h-3",
      text: "text-xs"
    },
    default: {
      container: "px-3 py-2 text-sm",
      icon: "w-4 h-4",
      text: "text-sm"
    },
    large: {
      container: "px-4 py-3 text-base",
      icon: "w-5 h-5",
      text: "text-base"
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  const fetchCredits = async () => {
    // Don't fetch if no firebaseId (user not logged in)
    if (!firebaseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const creditsData = await creditsService.getUserCredits(firebaseId);
      setCredits(creditsData);
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    // Explicit return to avoid async cleanup warning
    return undefined;
  }, [firebaseId]);

  const handleRefresh = () => {
    creditsService.clearCache();
    fetchCredits();
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 bg-gray-100 rounded-lg ${config.container} ${className}`}>
        <RefreshCw className={`${config.icon} animate-spin text-gray-400`} />
        <span className={`${config.text} text-gray-500`}>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`inline-flex items-center gap-2 bg-red-50 rounded-lg ${config.container} ${className}`}>
        <AlertCircle className={`${config.icon} text-red-500`} />
        <span className={`${config.text} text-red-600`}>Error</span>
        {showRefreshButton && (
          <button
            onClick={handleRefresh}
            className="ml-1 p-1 hover:bg-red-100 rounded"
            title="Retry"
          >
            <RefreshCw className="w-3 h-3 text-red-500" />
          </button>
        )}
      </div>
    );
  }

  if (!credits) {
    return (
      <div className={`inline-flex items-center gap-2 bg-gray-100 rounded-lg ${config.container} ${className}`}>
        <Coins className={`${config.icon} text-gray-400`} />
        <span className={`${config.text} text-gray-500`}>No data</span>
      </div>
    );
  }

  const statusColor = creditsService.getCreditStatusColor(credits.current_credits);
  const statusMessage = creditsService.getCreditStatusMessage(credits.current_credits);

  return (
    <div 
      className={`inline-flex items-center gap-2 bg-white border rounded-lg ${config.container} ${className}`}
      title={statusMessage}
    >
      <Coins className={`${config.icon} ${statusColor}`} />
      <div className="flex flex-col">
        <span className={`${config.text} font-medium ${statusColor}`}>
          {creditsService.formatCredits(credits.current_credits)} credits
        </span>
        {size !== 'small' && credits.total_spent_credits > 0 && (
          <span className="text-xs text-gray-400">
            {creditsService.formatCredits(credits.total_spent_credits)} used
          </span>
        )}
      </div>
      {showRefreshButton && (
        <button
          onClick={handleRefresh}
          className="ml-1 p-1 hover:bg-gray-100 rounded"
          title="Refresh credits"
        >
          <RefreshCw className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
}


