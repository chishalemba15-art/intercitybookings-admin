'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FloatPurchaseModalProps {
  onClose: () => void;
  agentId: string;
  currentBalance: number;
  onPurchaseSuccess: () => void;
}

const FLOAT_PACKAGES = [
  { amount: 50, zmw: 50, requests: 25 },
  { amount: 100, zmw: 100, requests: 50 },
  { amount: 250, zmw: 250, requests: 125 },
  { amount: 500, zmw: 500, requests: 250 },
];

export default function FloatPurchaseModal({
  onClose,
  agentId,
  currentBalance,
  onPurchaseSuccess,
}: FloatPurchaseModalProps) {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState(FLOAT_PACKAGES[0]);
  const [step, setStep] = useState<'package' | 'payment' | 'processing' | 'success'>('package');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmPackage = () => {
    setError('');
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      // In test mode, we'll simulate the payment
      // For production, integrate with actual payment provider (Stripe, Pesapal, Flutterwave, etc.)

      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Process float purchase
      const response = await fetch('/api/agent/float/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: parseInt(agentId),
          amountZmw: selectedPackage.zmw,
          requestsAllocated: selectedPackage.requests,
          paymentMethod,
          paymentReference: `${paymentMethod === 'mtn_momo' ? 'MTN' : 'ATL'}${Date.now()}`,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setStep('success');
    } catch (err) {
      setStep('payment');
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    onPurchaseSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {step === 'package' && 'Buy Float'}
            {step === 'payment' && 'Payment Details'}
            {step === 'processing' && 'Processing...'}
            {step === 'success' && 'Success!'}
          </h2>
          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Step 1: Select Package */}
        {step === 'package' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-4">
              Current Balance: <span className="font-semibold text-slate-900">{currentBalance} ZMW</span>
            </p>

            <div className="space-y-3">
              {FLOAT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full p-4 border-2 rounded-lg transition-all ${
                    selectedPackage.amount === pkg.amount
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{pkg.zmw} ZMW</p>
                      <p className="text-sm text-slate-600">{pkg.requests} requests</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedPackage.amount === pkg.amount
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedPackage.amount === pkg.amount && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirmPackage}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 'payment' && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                You're about to purchase <span className="font-semibold">{selectedPackage.zmw} ZMW</span> in float credit
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    value="mtn_momo"
                    checked={paymentMethod === 'mtn_momo'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'mtn_momo' | 'airtel_money')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 font-medium text-slate-900">MTN Mobile Money</span>
                </label>
                <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    value="airtel_money"
                    checked={paymentMethod === 'airtel_money'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'mtn_momo' | 'airtel_money')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 font-medium text-slate-900">Airtel Money</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError('');
                }}
                placeholder="+260 97 1234567"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter the phone number to charge (e.g., +260 or 0)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <p className="text-xs text-slate-500 text-center py-2">
              💡 In test mode, payments are simulated. Use any phone number to proceed.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('package')}
                className="flex-1 text-slate-600 font-medium py-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Processing your payment...</p>
            <p className="text-sm text-slate-500 mt-2">Please wait while we complete your float purchase</p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Purchase Successful!</h3>
              <p className="text-sm text-slate-600 mt-2">
                You've added {selectedPackage.zmw} ZMW to your float account
              </p>
              <p className="text-sm text-slate-600">
                You now have {selectedPackage.requests} requests available
              </p>
            </div>
            <button
              onClick={handleSuccess}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
