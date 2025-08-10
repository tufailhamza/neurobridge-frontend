export const env = {
  // Backend API configuration
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  
  // Other environment variables can be added here
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

// Validate required environment variables
export const validateEnv = () => {
  const required = ['NEXT_PUBLIC_BACKEND_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
};

// Call validation in development
if (process.env.NODE_ENV === 'development') {
  validateEnv();
}
