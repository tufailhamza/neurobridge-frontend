import { loadStripe } from '@stripe/stripe-js';
import { env } from '@/config/env';

// Load Stripe
const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

// Debug: Log the Stripe key (only first few characters for security)
console.log('Stripe publishable key loaded:', env.STRIPE_PUBLISHABLE_KEY ? `${env.STRIPE_PUBLISHABLE_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('Backend URL loaded:', env.BACKEND_URL);
console.log('Environment variables check:', {
  BACKEND_URL: env.BACKEND_URL,
  STRIPE_KEY: env.STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
  NODE_ENV: env.NODE_ENV
});

export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentParams {
  amount: number; // amount in cents
  currency: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  static async createCheckoutSession(params: CreateCheckoutSessionParams) {
    try {
      console.log('Creating checkout session with params:', params);
      console.log('Backend URL being used:', env.BACKEND_URL);
      console.log('Full URL:', `${env.BACKEND_URL}/stripe/create-checkout-session`);
      
      const response = await fetch(`${env.BACKEND_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend response error:', response.status, errorText);
        throw new Error(`Failed to create checkout session: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Backend response:', responseData);
      
      const { sessionId } = responseData;
      if (!sessionId) {
        throw new Error('No sessionId returned from backend');
      }
      
      console.log('Session ID received:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  static async createPaymentIntent(params: CreatePaymentIntentParams) {
    try {
      const response = await fetch(`${env.BACKEND_URL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  static async redirectToCheckout(sessionId: string) {
    console.log('Attempting to redirect to checkout with sessionId:', sessionId);
    
    const stripe = await stripePromise;
    if (!stripe) {
      console.error('Stripe failed to load');
      throw new Error('Stripe failed to load');
    }

    console.log('Stripe loaded successfully, redirecting...');
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
    
    console.log('Stripe redirect initiated successfully');
  }

  static async confirmPayment(clientSecret: string, paymentMethodId: string) {
    console.log('Confirming payment with:', { clientSecret: clientSecret.substring(0, 20) + '...', paymentMethodId });
    
    const stripe = await stripePromise;
    if (!stripe) {
      console.error('Stripe failed to load');
      throw new Error('Stripe failed to load');
    }

    console.log('Stripe loaded, confirming payment...');
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    });

    if (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }

    console.log('Payment confirmed successfully:', paymentIntent?.status);
    return paymentIntent;
  }
}
