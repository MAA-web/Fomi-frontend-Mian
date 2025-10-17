"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Download, Users, Crown, Star } from 'lucide-react';
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth';

function PaymentSuccessPageContent() {
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useFirebaseAuth();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

          // Verify the payment session
      const verifySession = async () => {
        try {
          console.log('🔄 Starting payment verification for session:', sessionId);
          
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            console.log('⏰ Payment verification timeout after 10 seconds');
          }, 10000); // 10 second timeout

          const response = await fetch('/api/verify-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log('📡 Verification response status:', response.status);

          const data = await response.json();
          console.log('📋 Verification response data:', data);

          if (data.success) {
            setSessionData(data.session);
            console.log('✅ Payment verified successfully:', data.session);
          } else {
            setError(data.error || 'Failed to verify payment session');
            console.error('❌ Payment verification failed:', data.error);
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            console.error('⏰ Payment verification timed out');
            setError('Payment verification timed out. Please try refreshing the page.');
          } else {
            console.error('❌ Error verifying session:', err);
            setError('Failed to verify payment session: ' + err.message);
          }
        } finally {
          setLoading(false);
        }
      };

    verifySession();
  }, [sessionId]);

  const getPlanDetails = (planId) => {
    const plans = {
      pro: {
        name: 'Pro Plan',
        icon: Crown,
        color: 'from-[#C15F3C] to-[#F59B7B]',
        features: ['500 generations/month', 'High quality images', 'Priority processing']
      },
      premium: {
        name: 'Premium Plan',
        icon: Star,
        color: 'from-purple-500 to-purple-700',
        features: ['Unlimited generations', 'Ultra high quality', 'API access']
      }
    };
    return plans[planId] || plans.pro;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C15F3C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-[#C15F3C] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#A54F32] transition-colors"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  const planDetails = sessionData ? getPlanDetails(sessionData.metadata?.planId) : null;
  const PlanIcon = planDetails?.icon || Crown;

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="px-10 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-xl opacity-90">
              Welcome to your new {planDetails?.name || 'subscription'}! Your account has been upgraded.
            </p>
          </div>
        </div>
      </div>

      <div className="px-10 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Payment Details Card */}
          {sessionData && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${planDetails.color} rounded-xl flex items-center justify-center text-white`}>
                    <PlanIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{planDetails.name}</h2>
                    <p className="text-gray-600">Subscription activated</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    ${(sessionData.amount_total / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {sessionData.currency?.toUpperCase()} • Monthly
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-gray-900">{sessionData.payment_intent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Paid</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">
                        {new Date(sessionData.created * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
                  <ul className="space-y-2">
                    {planDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Creating</h3>
              <p className="text-gray-600 mb-4">
                Your upgraded plan is now active. Start generating amazing images with your new features!
              </p>
              <button
                onClick={async () => {
                  // Update user's plan and redirect to pricing to show updated status
                  const planId = searchParams.get('plan_id') || sessionData?.metadata?.planId;
                  console.log('🔄 Redirecting with plan ID:', planId);
                  console.log('👤 Current user:', user);
                  
                  const userId = user?.uid || user?.id;
                  if (planId && userId) {
                    // Update localStorage immediately
                    localStorage.setItem(`userPlan_${userId}`, planId);
                    console.log('✅ Plan updated in localStorage:', planId);
                    
                    // Wait a moment to ensure auth state is stable
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Redirect to pricing with plan_upgraded parameter
                    router.push(`/pricing?plan_upgraded=${planId}`);
                  } else {
                    console.log('❌ Missing planId or userId:', { planId, userId });
                    router.push('/pricing');
                  }
                }}
                className="w-full bg-[#C15F3C] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#A54F32] transition-colors"
              >
                View Updated Plan
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Receipt</h3>
              <p className="text-gray-600 mb-4">
                Need a receipt for your records? Download your payment confirmation.
              </p>
              <button
                onClick={() => {
                  // This would typically download a PDF receipt
                  alert('Receipt download feature coming soon!');
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Download Receipt
              </button>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Your Subscription</h3>
                <p className="text-gray-600">View usage, update payment method, or change plans</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/profile')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Account Settings
              </button>
              <button
                onClick={() => {
                  // This would typically open a billing portal
                  alert('Billing portal coming soon!');
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Billing Portal
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Need help getting started? Our support team is here to help.
            </p>
            <button
              onClick={() => {
                // This would typically open a support chat or email
                window.location.href = 'mailto:support@fomi.ai';
              }}
              className="text-[#C15F3C] hover:text-[#A54F32] font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C15F3C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  );
}
