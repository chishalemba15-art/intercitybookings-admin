'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AgentLoginModalProps {
  onClose: () => void;
}

export default function AgentLoginModal({ onClose }: AgentLoginModalProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Phone validation (basic)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setShowPinInput(true);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin || pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/agent/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
          pin: pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        return;
      }

      // Store token and agent info
      localStorage.setItem('agentToken', data.token);
      localStorage.setItem('agentId', data.agent.id);
      localStorage.setItem('agentName', `${data.agent.firstName} ${data.agent.lastName}`);
      localStorage.setItem('agentPhone', phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`);

      // Redirect to dashboard
      router.push('/agent/dashboard');
      onClose();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {showPinInput ? 'Enter PIN' : 'Agent Login'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showPinInput ? (
          // Phone Input Form
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
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
                Enter your registered phone number (e.g., +260 or 0)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>

            <p className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onClose}
                className="text-blue-600 hover:underline font-medium"
              >
                Register here
              </button>
            </p>
          </form>
        ) : (
          // PIN Input Form
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Phone: <span className="font-medium text-slate-900">{phoneNumber}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter Your 4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(val);
                  setError('');
                }}
                placeholder="••••"
                maxLength={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-semibold"
              />
              <p className="text-xs text-slate-500 mt-1">
                Your PIN is a 4-digit code for secure login
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPinInput(false);
                setPin('');
                setError('');
              }}
              className="w-full text-slate-600 font-medium py-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Back
            </button>

            <p className="text-center text-xs text-slate-500">
              For test login, use PIN: <span className="font-mono bg-slate-100 px-1 rounded">1234</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
