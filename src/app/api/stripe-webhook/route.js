import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY_HERE', {
  apiVersion: '2023-10-16',
});

// Webhook secret from Stripe dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET_HERE';

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    console.log('🔔 Webhook event received:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);
        console.log('📋 Session data:', {
          userId: session.metadata?.userId,
          planId: session.metadata?.planId,
          customerEmail: session.customer_details?.email,
          paymentStatus: session.payment_status
        });
        
        // Forward to backend webhook
        await forwardToBackendWebhook(event);
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('🆕 Subscription created:', subscription.id);
        await forwardToBackendWebhook(event);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('🔄 Subscription updated:', updatedSubscription.id);
        await forwardToBackendWebhook(event);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('❌ Subscription cancelled:', deletedSubscription.id);
        await forwardToBackendWebhook(event);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('💰 Invoice payment succeeded:', invoice.id);
        await forwardToBackendWebhook(event);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('💸 Invoice payment failed:', failedInvoice.id);
        await forwardToBackendWebhook(event);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Forward webhook to backend service
async function forwardToBackendWebhook(event) {
  try {
    console.log('🔄 Forwarding webhook to backend...');
    
    const response = await fetch('https://api.tarum.ai/payment-service/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Stripe-Webhook-Forwarder/1.0'
      },
      body: JSON.stringify(event)
    });

    if (response.ok) {
      console.log('✅ Webhook forwarded successfully to backend');
    } else {
      console.error('❌ Backend webhook failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Backend error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Failed to forward webhook to backend:', error.message);
  }
}

// Helper function to handle successful payment (for local testing)
async function handleSuccessfulPayment(session) {
  try {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    
    if (!userId || !planId) {
      console.error('❌ Missing userId or planId in session metadata');
      return;
    }

    console.log('🔄 Updating user plan locally for testing...');
    console.log('👤 User ID:', userId);
    console.log('📦 Plan ID:', planId);
    
    // For local testing, you could update localStorage or make a direct API call
    // This is just for development - the real update should happen in the backend
    
  } catch (error) {
    console.error('❌ Error handling successful payment:', error);
  }
}
