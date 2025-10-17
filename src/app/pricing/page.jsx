"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Star, 
  ArrowRight,
  Sparkles,
  Users,
  Shield,
  Headphones
} from 'lucide-react';
import { pricingPlans } from '../../lib/pricing-plans';
import useFirebaseAuth from '../../lib/hooks/useFirebaseAuth';
import getStripe from '../../lib/stripe';
import firebaseAuthService from '../../lib/firebaseAuth';
import Header from '@/components/layout/Header';

function PricingPageContent() {
  const [loading, setLoading] = useState(null);
  const [billingInterval, setBillingInterval] = useState('month');
  const [userPlan, setUserPlan] = useState('free'); // Track user's current plan
  const [authTimeout, setAuthTimeout] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useFirebaseAuth();

  // Get user's current plan (for now, check localStorage or user object)
  const getCurrentUserPlan = () => {
    // Check if user has subscription data (would come from backend in real app)
    const userId = user?.uid || user?.id || localStorage.getItem('lastUserId');
    const savedPlan = userId ? localStorage.getItem(`userPlan_${userId}`) : null;
    console.log('📋 getCurrentUserPlan:', { userId, savedPlan, returning: savedPlan || 'free' });
    return savedPlan || 'free';
  };

  // Update user plan after successful payment
  const updateUserPlan = (planId) => {
    const userId = user?.uid || user?.id; // Firebase transformed user uses 'id'
    console.log('🔄 updateUserPlan called:', { planId, userId, user });
    
    if (userId) {
      localStorage.setItem(`userPlan_${userId}`, planId);
      localStorage.setItem('lastUserId', userId); // Store for test plan switcher
      setUserPlan(planId);
      console.log('✅ Plan updated:', { planId, stored: localStorage.getItem(`userPlan_${userId}`) });
    } else {
      console.log('❌ Cannot update plan - no user ID');
    }
  };

  // NEW: Sync user data with backend after payment
  const syncUserDataWithBackend = async () => {
    // Try multiple sources for user ID
    let userId = user?.uid || user?.id || localStorage.getItem('lastUserId');
    
    // If still no user ID, try to get it from Firebase auth service directly
    if (!userId) {
      try {
        const firebaseUser = firebaseAuthService.getCurrentUser();
        if (firebaseUser) {
          userId = firebaseUser.uid;
          console.log('🔍 Got user ID from Firebase auth service:', userId);
          // Store it for future use
          localStorage.setItem('lastUserId', userId);
        }
      } catch (error) {
        console.log('⚠️ Could not get user from Firebase auth service:', error);
      }
    }
    
    if (!userId) {
      console.log('⚠️ Cannot sync with backend - no user ID available');
      console.log('🔍 Available data:', { 
        user: user, 
        lastUserId: localStorage.getItem('lastUserId'),
        isAuthenticated,
        firebaseUser: firebaseAuthService.getCurrentUser()
      });
      console.log('💡 Please log in first to sync with backend');
      return;
    }

    try {
      console.log('🔄 Syncing user data with backend...');
      console.log('👤 Using user ID:', userId);
      
      // Get Firebase token for backend authentication
      const token = await firebaseAuthService.getIdToken();
      if (!token) {
        console.log('⚠️ No Firebase token available for backend sync');
        return;
      }
      
      console.log('🔑 Firebase token obtained for backend call');
      console.log('🔍 Token details:', {
        length: token.length,
        preview: token.substring(0, 50) + '...',
        fullToken: token // Full token for debugging
      });

      // Fetch updated user data from backend
      const response = await fetch(`https://api.tarum.ai/user-service/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Backend sync successful:', userData);
        
        // Update plan from backend data if available
        if (userData.current_plan && userData.current_plan !== userPlan) {
          console.log('🔄 Updating plan from backend:', userData.current_plan);
          setUserPlan(userData.current_plan);
          
          // Also update localStorage to keep it in sync
          localStorage.setItem(`userPlan_${userId}`, userData.current_plan);
        }
      } else {
        console.log('⚠️ Backend sync failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Backend sync error:', error.message);
      // Don't throw error - fallback to localStorage data
    }
  };

  // Load user's current plan on component mount
  useEffect(() => {
    const userId = user?.uid || user?.id || localStorage.getItem('lastUserId');
    if (userId) {
      const currentPlan = getCurrentUserPlan();
      setUserPlan(currentPlan);
      console.log('📋 Loaded user plan from storage:', currentPlan);
      
      // NEW: Also sync with backend to get latest data
      syncUserDataWithBackend();
    }
  }, [user?.uid, user?.id, isAuthenticated]);


  // Check for successful payment return - only after auth is loaded
  useEffect(() => {
    // Don't process URL params while auth is still loading
    // if () {
    //   console.log('⏳ Auth still loading, waiting to process URL params...');
    //   return;
    // }
    
    const planUpgraded = searchParams.get('plan_upgraded');
    const userId = user?.uid || user?.id || localStorage.getItem('lastUserId');
    
    console.log('🔍 Checking URL params:', { planUpgraded, userId});
    
    if (planUpgraded && userId) {
      console.log('🎉 Plan upgraded to:', planUpgraded);
      updateUserPlan(planUpgraded);
      console.log('✅ Plan updated via URL parameter');
      
      // NEW: Sync with backend to get updated user data
      setTimeout(() => {
        syncUserDataWithBackend();
      }, 1000); // Wait 1 second for backend to process webhook
      
      // Remove the parameter from URL
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('plan_upgraded');
      window.history.replaceState({}, '', newUrl);
    } else if (planUpgraded && !userId) {
      console.log('⚠️ Plan upgrade parameter found but no user yet, will retry...');
    }
  }, [searchParams, user?.uid, user?.id, ]);

  const handleSubscribe = async (plan) => {
    console.log('🔄 Handle Subscribe clicked for:', plan.name);
    
    // Debug authentication state
    console.log('🔍 Auth state debug:', {
      isAuthenticated,
      user: user ? { id: user.id, uid: user.uid, email: user.email } : null,
      authTimeout
    });
    
    // Wait for auth to finish loading (unless timeout occurred)
    // if (!authTimeout) {
    //   console.log('⏳ Auth still loading, please wait...');
    //   return;
    // }
    
    // Check authentication status
    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated, redirecting to auth page');
      console.log('🔍 Auth check details:', {
        isAuthenticated,
        hasUser: !!user,
        userDetails: user
      });
      
      // Try to get user from localStorage as fallback
      const lastUserId = localStorage.getItem('lastUserId');
      if (lastUserId) {
        console.log('🔄 Found user ID in localStorage, attempting to proceed:', lastUserId);
        // Create a minimal user object for the checkout
        const fallbackUser = {
          id: lastUserId,
          uid: lastUserId,
          email: 'user@example.com' // This will be overridden by Stripe checkout
        };
        
        console.log('🔄 Using fallback user for checkout:', fallbackUser);
        // Continue with checkout using fallback user
        await proceedWithCheckout(plan, fallbackUser);
        return;
      }
      
      router.push('/auth');
      return;
    }
    
    // If we have a valid user, proceed with checkout
    await proceedWithCheckout(plan, user);
  };

  const proceedWithCheckout = async (plan, userToUse) => {
    if (plan.id === 'free') {
      // Free plan - redirect to profile or show message
      router.push('/profile');
      return;
    }

    setLoading(plan.id);

    try {
      // Create checkout session
      console.log('🔄 Creating Stripe checkout session for:', plan.name);
      console.log('📋 Request data:', {
        priceId: plan.priceId,
        userId: userToUse.id || userToUse.uid,
        planId: plan.id
      });
      console.log('🔍 Full user object being sent:', userToUse);

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: userToUse.id || userToUse.uid, // Use the provided user object
          planId: plan.id,
          successUrl: `${window.location.origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan.id}`,
          cancelUrl: `${window.location.origin}/pricing/cancel`,
        }),
      });

      const { sessionId, error } = await response.json();
      
      if (sessionId) {
        console.log('✅ Checkout session created:', sessionId);
      } else {
        console.error('❌ Failed to create session:', error);
      }

      if (error) {
        console.error('Error creating checkout session:', error);
        alert('Error creating checkout session. Please try again.');
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        alert('Error redirecting to checkout. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free':
        return <Sparkles className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      case 'premium':
        return <Star className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'free':
        return 'from-gray-400 to-gray-600';
      case 'pro':
        return 'from-[#C15F3C] to-[#F59B7B]';
      case 'premium':
        return 'from-purple-500 to-purple-700';
      default:
        return 'from-blue-500 to-blue-700';
    }
  };

  // Add timeout for auth loading to prevent infinite loading
  useEffect(() => {
      const timeout = setTimeout(() => {
        console.log('⚠️ Auth loading timeout - proceeding without auth');
        setAuthTimeout(true);
        
        // Try to load plan from localStorage even without full auth
        const planUpgraded = searchParams.get('plan_upgraded');
        if (planUpgraded) {
          console.log('🔄 Loading plan from URL parameter after timeout:', planUpgraded);
          setUserPlan(planUpgraded);
          
          // Remove the parameter from URL
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('plan_upgraded');
          window.history.replaceState({}, '', newUrl);
        }
      }, 3000); // 3 second timeout (reduced)
      
      return () => clearTimeout(timeout);
  }, [searchParams]);

  // Show loading while Firebase auth initializes (with timeout)
  // if ( && !authTimeout) {
  //   return (
  //     <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 border-4 border-[#C15F3C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading authentication...</p>
  //         <p className="text-xs text-gray-400 mt-2">If this takes too long, try refreshing the page</p>
  //         <button 
  //           onClick={() => {
  //             console.log('🔄 Manual auth timeout triggered');
  //             setAuthTimeout(true);
  //           }}
  //           className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
  //         >
  //           Continue Anyway
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <Header />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-10 py-8">
          <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Purchase Your Plan
          </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upgrade to gain access to pro features and more generations
            </p>
            {/* Current Plan Display */}
            {(isAuthenticated || authTimeout) && (
              <div className="mt-4 space-y-2">
                <div className="inline-flex items-center bg-gray-100 px-4 py-2 rounded-full">
                  <span className="text-sm text-gray-600">Current Plan: </span>
                  <span className="ml-1 font-semibold text-gray-900 capitalize">{userPlan}</span>
                </div>
                {/* Test Plan Switcher (for testing only) */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    Test Plan Switcher: 
                    <button 
                      onClick={() => {
                        // Try to get user ID from multiple sources
                        const userId = user?.uid || user?.id || localStorage.getItem('lastUserId');
                        if (userId) {
                          localStorage.setItem(`userPlan_${userId}`, 'free');
                          setUserPlan('free');
                          console.log('✅ Test plan switched to Free');
                        } else {
                          console.log('⚠️ No user ID available for test plan switch');
                        }
                      }} 
                      className="mx-1 text-blue-600 hover:underline"
                    >
                      Free
                    </button>
                    <button 
                      onClick={() => {
                        const userId = user?.uid || user?.id || localStorage.getItem('lastUserId');
                        if (userId) {
                          localStorage.setItem(`userPlan_${userId}`, 'pro');
                          setUserPlan('pro');
                          console.log('✅ Test plan switched to Pro');
                        } else {
                          console.log('⚠️ No user ID available for test plan switch');
                        }
                      }} 
                      className="mx-1 text-blue-600 hover:underline"
                    >
                      Pro
                    </button>
                    <button 
                      onClick={() => {
                        const userId = user?.uid || user?.id || localStorage.getItem('lastUserId');
                        if (userId) {
                          localStorage.setItem(`userPlan_${userId}`, 'premium');
                          setUserPlan('premium');
                          console.log('✅ Test plan switched to Premium');
                        } else {
                          console.log('⚠️ No user ID available for test plan switch');
                        }
                      }} 
                      className="mx-1 text-blue-600 hover:underline"
                    >
                      Premium
                    </button>
                  </div>
                  <div>
                    Test Payment Success: 
                    <button 
                      onClick={() => {
                        const userId = user?.uid || user?.id || localStorage.getItem('lastUserId');
                        if (userId) {
                          localStorage.setItem(`userPlan_${userId}`, 'pro');
                          router.push('/pricing?plan_upgraded=pro');
                        }
                      }} 
                      className="mx-1 text-green-600 hover:underline"
                    >
                      Simulate Pro Payment
                    </button>
                  </div>
                  <div>
                    Backend Sync: 
                    <button 
                      onClick={syncUserDataWithBackend}
                      className="mx-1 text-purple-600 hover:underline"
                    >
                      Sync with Backend
                    </button>
                  </div>
                  <div>
                    Auth Debug: 
                    <button 
                      onClick={() => {
                        console.log('🔍 Current auth state:', {
                          isAuthenticated,
                          user: user ? { id: user.id, uid: user.uid, email: user.email } : null,
                          authTimeout
                        });
                        console.log('🔍 Firebase user:', firebaseAuthService.getCurrentUser());
                        console.log('🔍 localStorage userId:', localStorage.getItem('lastUserId'));
                      }}
                      className="mx-1 text-orange-600 hover:underline"
                    >
                      Debug Auth
                    </button>
                  </div>
                  <div>
                    Check User ID: 
                    <button 
                      onClick={() => {
                        const userId = user?.id || user?.uid || localStorage.getItem('lastUserId');
                        const fallbackUser = {
                          id: userId,
                          uid: userId,
                          email: 'user@example.com'
                        };
                        
                        console.log('🔍 User ID that would be sent to Stripe:');
                        console.log('📋 User ID:', userId);
                        console.log('📋 User object:', user);
                        console.log('📋 Fallback user:', fallbackUser);
                        console.log('📋 Firebase user:', firebaseAuthService.getCurrentUser());
                        
                        alert(`User ID that would be sent to Stripe: ${userId}\n\nCheck console for full details.`);
                      }}
                      className="mx-1 text-blue-600 hover:underline"
                    >
                      Show User ID
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
          
          {/* Billing Toggle */}
      <div className="px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-12">
            
            <div className="bg-white border font-[400] rounded-[22px] text-[#4A4A4A]">

              <div className="flex">

                <button
                      onClick={() => setBillingInterval('year')}
                      className={`px-10 py-1 rounded-lg text-xs transition-colors relative ${
                        billingInterval === 'year'
                      ? 'bg-[#F7D1C3]'
                          : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                </button>

                <button
                      onClick={() => setBillingInterval('month')}
                      className={`px-10 py-1 rounded-lg text-xs transition-colors relative ${
                        billingInterval === 'month'
                      ? 'bg-[#F7D1C3]'
                          : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>

              </div>
          </div>
        </div>

        {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => {
              const isCurrentPlan = userPlan === plan.id;
              const isUpgrade = !isCurrentPlan && (
                (userPlan === 'free' && (plan.id === 'pro' || plan.id === 'premium')) ||
                (userPlan === 'pro' && plan.id === 'premium')
              );
              const isDowngrade = !isCurrentPlan && (
                (userPlan === 'premium' && (plan.id === 'pro' || plan.id === 'free')) ||
                (userPlan === 'pro' && plan.id === 'free')
              );

              return (
              <div
               key={plan.id}
                  className={`relative bg-white rounded-[23px] border-[#766F67] border-[9px] transition-all duration-300 hover:shadow-lg `}
                >
                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">

                  </div>
                )}

                {/* Popular Badge */}
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[linear-gradient(217deg,_#C5BEB6_-1.7%,_#746D65_95.57%)]">
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${getPlanColor(plan.id)} text-white mb-4`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      {plan.price === 0 ? (
                        <div className="text-4xl font-bold text-gray-900">Free</div>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-gray-900">
                            ${billingInterval === 'year' ? (plan.price * 12 * 0.8).toFixed(2) : plan.price}
                            <span className="text-lg font-normal text-gray-600">
                              /{billingInterval === 'year' ? 'year' : 'month'}
                            </span>
                          </div>
                          {billingInterval === 'year' && (
                            <div className="text-sm text-green-600 font-medium">
                              Save ${(plan.price * 12 * 0.2).toFixed(2)} per year
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loading === plan.id || isCurrentPlan}
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                        isCurrentPlan
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : plan.popular && !isCurrentPlan
                          ? 'bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] text-white hover:shadow-lg transform hover:scale-105'
                          : plan.price === 0
                          ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                          : isDowngrade
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {loading === plan.id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>
                            {isCurrentPlan 
                              ? 'Current Plan' 
                              : isDowngrade 
                              ? 'Downgrade' 
                              : isUpgrade 
                              ? `Upgrade to ${plan.name}` 
                              : plan.buttonText
                            }
                          </span>
                          {!isCurrentPlan && plan.price > 0 && <ArrowRight className="w-4 h-4" />}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      What's included:
                    </h4>
                    <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                ))}
              </ul>
              
                        {/* Limitations */}
                        {plan.limitations.length > 0 && (
                          <>
                            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mt-6">
                              Limitations:
                            </h4>
                            <ul className="space-y-3">
                              {plan.limitations.map((limitation, index) => (
                                <li key={index} className="flex items-start space-x-3">
                                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-600 text-sm">{limitation}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
              );
            })}
          </div>

          {/* Feature Comparison */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compare All Features
              </h2>
              <p className="text-gray-600">
                See what's included in each plan
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Features</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900">Free</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900">Pro</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Monthly Generations</td>
                      <td className="px-6 py-4 text-center text-gray-600">300</td>
                      <td className="px-6 py-4 text-center text-gray-600">1,500</td>
                      <td className="px-6 py-4 text-center text-green-600 font-medium">Unlimited</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Max Resolution</td>
                      <td className="px-6 py-4 text-center text-gray-600">512x512</td>
                      <td className="px-6 py-4 text-center text-gray-600">2048x2048</td>
                      <td className="px-6 py-4 text-center text-green-600 font-medium">4096x4096</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Priority Processing</td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">API Access</td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Support</td>
                      <td className="px-6 py-4 text-center text-gray-600">Community</td>
                      <td className="px-6 py-4 text-center text-gray-600">Email</td>
                      <td className="px-6 py-4 text-center text-green-600 font-medium">Priority</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
        </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
          </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Can I change plans anytime?</h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">What happens to unused credits?</h3>
                <p className="text-gray-600">
                  Unused credits roll over to the next month for Pro and Premium plans. Free plan credits reset monthly.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Is there a free trial?</h3>
                <p className="text-gray-600">
                  Our Free plan gives you a great taste of what FOMI can do. No credit card required to get started!
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">How does billing work?</h3>
                <p className="text-gray-600">
                  All plans are billed monthly or yearly. You can cancel anytime and your subscription will remain active until the end of your billing period.
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C15F3C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  );
}