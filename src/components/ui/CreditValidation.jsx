'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Coins, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import creditsService from '../../lib/services/creditsService';
import firebaseAuthService from '../../lib/firebaseAuth';

export default function CreditValidation({ 
  modelName,
  onValidationResult = () => {},
  showPurchaseLink = true,
  page = '',
  className = ""
}) {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkCredits = async () => {
      if (!modelName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("cccccccccccccccccccccc" + modelName);
        const result = await creditsService.hasEnoughCredits(modelName, page);
        setValidation(result);
        onValidationResult(result);
      } catch (error) {
        console.error('Credit validation error:', error);
        const errorResult = {
          hasEnough: false,
          current: 0,
          required: 1,
          remaining: -1,
          error: error.message
        };
        setValidation(errorResult);
        onValidationResult(errorResult);
      } finally {
        setLoading(false);
      }
    };

    checkCredits();
  }, [modelName]);

  const handlePurchaseCredits = () => {
    router.push('/pricing');
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Checking credits...</span>
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  if (validation.error) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <span className="text-sm text-red-700">
          Error checking credits: {validation.error}
        </span>
      </div>
    );
  }

  if (validation.hasEnough) {
    return (
      <div className={`flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <Coins className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-green-800 font-medium">
            Ready to generate!
          </div>
          <div className="text-sm text-green-800 font-medium">
            Cost: <span className="font-bold">{validation.required} credits</span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            You have {creditsService.formatCredits(validation.current)} credits. After generation: {creditsService.formatCredits(validation.remaining)} credits remaining.
          </div>
        </div>
      </div>
    );
  }

  // Insufficient credits
  return (
    <div className={`p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm text-red-800 font-medium">
            Insufficient Credits
          </div>
          <div className="text-sm text-red-700 mt-1">
            You need <strong>{validation.required} credits</strong> but only have{' '}
            <strong>{creditsService.formatCredits(validation.current)} credits</strong>.
          </div>
          {showPurchaseLink && (
            <button
              onClick={handlePurchaseCredits}
              className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              <Coins className="w-3 h-3" />
              Purchase Credits
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


