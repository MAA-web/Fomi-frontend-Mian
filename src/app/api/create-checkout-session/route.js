import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY_HERE', {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    const { priceId, userId, planId, successUrl, cancelUrl } = await request.json();

    // Validate required fields
    if (!priceId || !userId || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, userId, or planId' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pricing/cancel`,
      metadata: {
        userId,
        planId,
      },
      customer_email: undefined, // Will be filled by Stripe Checkout
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

