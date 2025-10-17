import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    // Replace with your actual Stripe publishable key from dashboard.stripe.com
    // Make sure you're in "Test mode" when copying the key
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;






