export const env = {
  // Backend API configuration
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  
  // Stripe configuration
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here',
  
  // PubNub configuration
  PUBNUB_PUBLISH_KEY: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY || '',
  PUBNUB_SUBSCRIBE_KEY: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY || '',
  PUBNUB_SECRET_KEY: process.env.NEXT_PUBLIC_PUBNUB_SECRET_KEY || '',
  
  // Other environment variables can be added here
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

