'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password });
    router.push('/clinician/home');
  };

  const handleCreateAccount = () => {
    // Navigate to signup page
    router.push('/signup');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-d">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="">
          {/* Title */}
          <div className="text-left mb-8">
            <img 
              src="/logo.png" 
              alt="Neurobridge Logo" 
              className="mx-auto h-8 w-auto"
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:outline-none"
                placeholder="Example@gmail.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900  mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:outline-none"
                  placeholder="Enter at least 8 characters"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-900 hover:text-gray-600   transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            {/* Forgot Password Link */}
            <div className="text-left">
              <a
                href="#"
                className="text-sm text-b transition-colors"
              >
                Forgot password?
              </a>
            </div>
            </div>


            {/* Login Button */}
            <button
              type="submit"
              onClick={handleLogin}
              className="w-full bg-a hover:bg-a-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Log in
            </button>

            {/* Create Account Button */}
            <button
              type="button"
              onClick={handleCreateAccount}
              className="w-full bg-d border border-gray-600 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none "
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 