import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY_HERE', {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if the payment was successful
    if (session.payment_status === 'paid') {
      // Here you would typically:
      // 1. Update user's subscription in your database
      // 2. Send confirmation email
      // 3. Update user's plan and credits
      
      console.log('Payment successful for session:', sessionId);
      console.log('Customer email:', session.customer_details?.email);
      console.log('Plan ID:', session.metadata?.planId);
      console.log('User ID:', session.metadata?.userId);

      // TODO: Integrate with your backend to update user subscription
      // Example:
      // await updateUserSubscription({
      //   userId: session.metadata.userId,
      //   planId: session.metadata.planId,
      //   stripeCustomerId: session.customer,
      //   subscriptionId: session.subscription,
      // });

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details?.email,
          payment_intent: session.payment_intent,
          subscription: session.subscription,
          created: session.created,
          metadata: session.metadata,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Payment not completed',
        session: {
          id: session.id,
          payment_status: session.payment_status,
        },
      });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify session' },
      { status: 500 }
    );
  }
}
