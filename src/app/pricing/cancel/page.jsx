"use client";

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle, CreditCard, HelpCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

  const commonIssues = [
    {
      icon: CreditCard,
      title: 'Payment Method Issues',
      description: 'Card declined, expired, or insufficient funds',
      solution: 'Try a different payment method or contact your bank'
    },
    {
      icon: RefreshCw,
      title: 'Technical Issues',
      description: 'Connection timeout or processing error',
      solution: 'Refresh and try again, or contact support'
    },
    {
      icon: HelpCircle,
      title: 'Need More Information',
      description: 'Want to learn more about the plans',
      solution: 'Check our FAQ or contact our sales team'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="px-10 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
            <p className="text-xl opacity-90">
              Don't worry! Your payment was not processed and no charges were made.
            </p>
          </div>
        </div>
      </div>

      <div className="px-10 py-12">
        <div className="max-w-4xl mx-auto">
          {/* What Happened */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Happened?</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Your payment process was cancelled before completion. This could happen for several reasons:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You clicked the back button or closed the payment window</li>
                <li>There was an issue with your payment method</li>
                <li>The payment session timed out</li>
                <li>You decided to review the plans further</li>
              </ul>
              <p className="font-medium text-gray-900">
                No charges were made to your account.
              </p>
            </div>
          </div>

          {/* Common Issues & Solutions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Issues & Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {commonIssues.map((issue, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <issue.icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{issue.description}</p>
                  <p className="text-[#C15F3C] text-sm font-medium">{issue.solution}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 bg-[#C15F3C] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <RefreshCw className="w-5 h-5 text-[#C15F3C]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Try Again</h3>
              <p className="text-gray-600 mb-4">
                Ready to subscribe? Go back to our pricing page and try again.
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-[#C15F3C] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#A54F32] transition-colors"
              >
                Back to Pricing
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Our support team is here to help with any payment issues or questions.
              </p>
              <button
                onClick={() => {
                  window.location.href = 'mailto:support@fomi.ai?subject=Payment%20Issue';
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>

          {/* Alternative Options */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Not Ready to Subscribe?</h3>
            <p className="text-gray-600 mb-6">
              No problem! You can still enjoy FOMI with our free plan or explore other options.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/')}
                className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Continue with Free Plan
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Compare Plans
              </button>
              <button
                onClick={() => {
                  // This would typically open a demo or trial
                  router.push('/');
                }}
                className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Try Demo
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Was I charged for the cancelled payment?</h4>
                <p className="text-gray-600 text-sm">
                  No, cancelled payments are not processed. No charges were made to your payment method.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Can I try a different payment method?</h4>
                <p className="text-gray-600 text-sm">
                  Yes! Go back to the pricing page and try again with a different card or payment method.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">What if I keep having payment issues?</h4>
                <p className="text-gray-600 text-sm">
                  Contact our support team at support@fomi.ai and we'll help resolve any payment issues.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center space-x-2 text-[#C15F3C] hover:text-[#A54F32] font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}






