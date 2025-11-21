'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const registrationSchema = z.object({
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email().optional().or(z.literal('')),
  idType: z.enum(['national_id', 'drivers_license', 'passport']),
  idNumber: z.string().min(5, 'ID number required'),
  locationCity: z.string().min(2, 'City required'),
  locationAddress: z.string().optional().or(z.literal('')),
  referralCode: z.string().optional().or(z.literal('')),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

interface AgentRegistrationModalProps {
  onClose: () => void;
}

export default function AgentRegistrationModal({ onClose }: AgentRegistrationModalProps) {
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [phoneToVerify, setPhoneToVerify] = useState('');
  const [otp, setOtp] = useState('');
  const [agentId, setAgentId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmitForm = async (data: RegistrationForm) => {
    try {
      setLoading(true);
      const response = await fetch('/api/agent/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const result = await response.json();
      setPhoneToVerify(data.phoneNumber);
      setAgentId(result.agentId);
      setStep('otp');
      toast.success('OTP sent to your phone');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp || !phoneToVerify) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/agent/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneToVerify, otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      setStep('success');
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">
            {step === 'form' && 'Register as Agent'}
            {step === 'otp' && 'Verify Your Phone'}
            {step === 'success' && 'Welcome to InterCity!'}
          </h2>
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+260971234567"
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email (optional)
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ID Type
                </label>
                <select
                  {...register('idType')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select ID type</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">Passport</option>
                </select>
                {errors.idType && (
                  <p className="text-xs text-red-600 mt-1">{errors.idType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ID Number
                </label>
                <input
                  {...register('idNumber')}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456789"
                />
                {errors.idNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.idNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  {...register('locationCity')}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Lusaka"
                />
                {errors.locationCity && (
                  <p className="text-xs text-red-600 mt-1">{errors.locationCity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address (optional)
                </label>
                <input
                  {...register('locationAddress')}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Main Street, Kaunda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Referral Code (optional)
                </label>
                <input
                  {...register('referralCode')}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AGENT123"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                We'll send you an OTP via SMS to verify your number. Have your national ID ready.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                We sent a 6-digit OTP to <strong>{phoneToVerify}</strong>
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl letter-spacing"
                  placeholder="000000"
                />
              </div>

              <button
                onClick={handleOtpVerify}
                disabled={loading || otp.length !== 6}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                onClick={() => setStep('form')}
                className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-medium"
              >
                Back
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Your application is under review. We'll call you within 24-48 hours to verify your details.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-medium text-blue-900">What happens next:</p>
                <ul className="text-xs text-blue-900 space-y-1">
                  <li>✓ Our team will call to verify your information</li>
                  <li>✓ Once approved, you'll receive 50 ZMW free float</li>
                  <li>✓ You can then start viewing customer requests</li>
                  <li>✓ Support available 24/7 via WhatsApp</li>
                </ul>
              </div>

              <div className="text-sm text-slate-600">
                <p>Questions? Contact us:</p>
                <p className="font-semibold">+260 773 962 307</p>
              </div>

              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
