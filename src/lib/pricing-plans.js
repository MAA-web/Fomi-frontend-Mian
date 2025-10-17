// Pricing Plans Configuration
export const pricingPlans = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for getting started',
    price: 0,
    priceId: null, // No Stripe price ID for free plan
    interval: 'month',
    features: [
      '10 image generations per day',
      'Basic quality images',
      'Standard resolution',
      'Community support',
      'Basic templates'
    ],
    limitations: [
      'Limited to 512x512 resolution',
      'No priority processing',
      'Watermarked images'
    ],
    popular: false,
    buttonText: 'Current Plan',
    credits: 100
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    description: 'For creative professionals',
    price: 19.99,
    priceId: 'price_1S3B2UCbKDTgDwJ2RS9uWvWt', // Pro Plan Price ID from Stripe
    interval: 'month',
    features: [
      '500 image generations per month',
      'High quality images',
      'Up to 2048x2048 resolution',
      'Priority processing',
      'Advanced templates',
      'No watermarks',
      'Email support'
    ],
    limitations: [],
    popular: true,
    buttonText: 'Upgrade to Pro',
    credits: 500
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'For power users and teams',
    price: 49.99,
    priceId: 'price_1S3EIXCbKDTgDwJ28qBpNgYi', // Premium Plan Price ID from Stripe
    interval: 'month',
    features: [
      'Unlimited image generations',
      'Ultra high quality images',
      'Up to 4096x4096 resolution',
      'Fastest processing',
      'All templates and styles',
      'Custom model training',
      'Priority support',
      'API access',
      'Team collaboration'
    ],
    limitations: [],
    popular: false,
    buttonText: 'Go Premium',
    credits: 'unlimited'
  }
];

// Note: All price IDs are now configured in the pricingPlans array above
