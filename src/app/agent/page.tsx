'use client';

import { useState } from 'react';
import Link from 'next/link';
import AgentRegistrationModal from '@/components/agents/AgentRegistrationModal';
import AgentLoginModal from '@/components/agents/AgentLoginModal';

export default function AgentLandingPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">InterCity Agents</div>
          <div className="flex gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium">
              Main App
            </Link>
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setShowRegistration(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6">
            Find Customers,
            <span className="block text-blue-600 mt-2">Not the Bus.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Stop chasing customers. Let them come to you. With InterCity Agents, customers looking for bus tickets find your services first. Convert requests into commissions in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowRegistration(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors"
            >
              Start Earning Today
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-lg transition-colors"
            >
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Why Choose InterCity Agents?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Requests</h3>
              <p className="text-slate-600 leading-relaxed">
                Customers post booking requests in your area. You see them instantly. No more cold calling or waiting for word-of-mouth.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Flexible Pricing</h3>
              <p className="text-slate-600 leading-relaxed">
                Buy float as you go. 10 ZMW = 5 customer requests. No subscriptions. No hidden fees. Scale up when you're ready.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Payments</h3>
              <p className="text-slate-600 leading-relaxed">
                Process payments directly with customers. We handle ticket verification and SMS notifications to confirm bookings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Register Free',
                description: 'Sign up with your phone number. Takes 2 minutes. No registration fees.',
              },
              {
                step: '2',
                title: 'Buy Float',
                description: 'Purchase float via mobile money. 10 ZMW = 5 customer requests per day.',
              },
              {
                step: '3',
                title: 'See Requests',
                description: 'View customers looking for buses in your area. Pick the ones you want.',
              },
              {
                step: '4',
                title: 'Earn Commission',
                description: 'WhatsApp the customer. Close the sale. Upload receipt. Get paid.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
                {item.step !== '4' && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-blue-200 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            How Much Can You Earn?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Part-Time',
                requests: '5 requests/day',
                cost: '50 ZMW/week',
                earnings: '500-1,000 ZMW/week',
                commission: '~100-200 ZMW commission',
              },
              {
                title: 'Full-Time',
                requests: '25 requests/day',
                cost: '250 ZMW/week',
                earnings: '2,500-5,000 ZMW/week',
                commission: '~500-1,000 ZMW commission',
                featured: true,
              },
              {
                title: 'Top Agents',
                requests: '50+ requests/day',
                cost: '400 ZMW/week',
                earnings: '5,000+ ZMW/week',
                commission: '~1,000+ ZMW commission',
              },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-8 ${
                  tier.featured
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 text-white shadow-xl'
                    : 'bg-white border-slate-200'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${tier.featured ? '' : 'text-slate-900'}`}>
                  {tier.title}
                </h3>
                <div className={`space-y-3 text-sm ${tier.featured ? 'text-blue-100' : 'text-slate-600'}`}>
                  <div>
                    <p className={`font-medium ${tier.featured ? 'text-white' : 'text-slate-900'}`}>{tier.requests}</p>
                  </div>
                  <div>
                    <p className="opacity-75">Float cost: {tier.cost}</p>
                  </div>
                  <div className="pt-4 border-t border-opacity-20 border-current">
                    <p className={`font-bold text-lg ${tier.featured ? 'text-white' : 'text-green-600'}`}>
                      {tier.earnings}
                    </p>
                    <p className="text-xs opacity-75">{tier.commission}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-600 text-sm">
            *Earnings are customer commissions you negotiate. InterCity takes no commission - this is pure profit for you.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            What Agents Are Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Chanda Mwale',
                role: 'Agent in Lusaka',
                quote: 'I was making 200 ZMW a week doing this manually. Now with the platform, I make 2,000+ ZMW. No more searching for customers.',
              },
              {
                name: 'Abraham Nkosi',
                role: 'Agent in Kitwe',
                quote: 'The real-time requests are a game-changer. I process 15-20 bookings per day. Best side hustle ever.',
              },
              {
                name: 'Precious Banda',
                role: 'Agent in Ndola',
                quote: 'Started 2 months ago. Already reinvested my earnings to buy more float. This is my full-time job now.',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-4">{testimonial.quote}</p>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'How much does it cost to join?',
                a: 'Registration is free. You only pay for float (customer requests) as you use them. Start with as little as 10 ZMW.',
              },
              {
                q: 'How do I get approved?',
                a: 'Submit your application with your phone number and ID. Our team reviews and calls to verify. Approval takes 24-48 hours.',
              },
              {
                q: 'What if I don\'t complete a booking?',
                a: 'You only pay for requests you view. Once you view, the float is deducted. Complete the booking or not - your choice.',
              },
              {
                q: 'Can I do this part-time?',
                a: 'Absolutely! Many agents work 2-3 hours daily and make 300-500 ZMW. Scale as you grow.',
              },
              {
                q: 'How do I get paid?',
                a: 'You negotiate payment directly with customers. They pay you cash or mobile money. We don\'t take a cut.',
              },
              {
                q: 'What about customer support?',
                a: 'Our team is available 24/7 via WhatsApp and phone. We help with technical issues and customer disputes.',
              },
            ].map((item, idx) => (
              <details key={idx} className="group border border-slate-200 rounded-lg">
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-semibold hover:bg-slate-50">
                  <span className="text-slate-900">{item.q}</span>
                  <span className="transition group-open:rotate-180">
                    <svg className="h-5 w-5 text-slate-600" fill="none" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="px-6 py-4 pt-0 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 100+ agents making 2,000+ ZMW monthly. Your first 50 ZMW float is free when approved.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowRegistration(true)}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-slate-100 font-bold text-lg transition-colors"
            >
              Register as Agent Now
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors"
            >
              Login to Your Portal
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">InterCity Agents</h3>
            <p className="text-slate-400 text-sm">Finding customers for agents across Zambia.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white">How It Works</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="tel:+260773962307">+260 773 962 307</a></li>
              <li><a href="mailto:agents@intercity.zm">agents@intercity.zm</a></li>
              <li><a href="#">WhatsApp Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/" className="hover:text-white">Main App</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; 2024 InterCity Bookings. All rights reserved.</p>
        </div>
      </footer>

      {/* Registration Modal */}
      {showRegistration && (
        <AgentRegistrationModal onClose={() => setShowRegistration(false)} />
      )}

      {/* Login Modal */}
      {showLogin && (
        <AgentLoginModal onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
}
