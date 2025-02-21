'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AudioPlayer from '@/components/AudioPlayer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="hero text-center space-y-8 py-20">
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Generate Professional Radio Ads in Minutes—Powered by AI.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Craft scripts, art direction, and audio—all in one place.
          </p>
          <Link 
            href="/script"
            className="inline-block px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Create Your Customised Ad →
          </Link>
          
          {/* Sample Audio Player */}
          <div className="mt-12">
            <AudioPlayer
              title="Sample Ad for 'Morning Brew Coffee'"
              audioUrl="/sample-ad.mp3"  // This will be replaced with an actual sample
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works py-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Input',
                description: 'Describe your product',
                icon: '📝'
              },
              {
                title: 'Generate',
                description: 'Get a script + art direction',
                icon: '✨'
              },
              {
                title: 'Export',
                description: 'Edit and download your ad',
                icon: '⬇️'
              }
            ].map((step, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-200">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="features py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Features Highlight</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              'AI-generated scripts tailored to your product',
              'Art direction guidance for voice actors/producers',
              'One-click audio generation with our fine-tuned Text to Speech model',
              'Instant editing or refinement with AI feedback',
              'Responsive design',
              'Export in multiple formats'
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="text-purple-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-300">{feature}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials py-20">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Saved me 10 hours scripting ads for my bakery!",
                author: "Sarah Johnson",
                role: "Bakery Owner"
              },
              {
                quote: "The AI understands exactly what my brand needs.",
                author: "Mike Chen",
                role: "Marketing Director"
              },
              {
                quote: "Professional quality ads in minutes. Incredible!",
                author: "Lisa Rodriguez",
                role: "Small Business Owner"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <div className="text-purple-500 mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-300 mb-4">{testimonial.quote}</p>
                <div className="text-sm">
                  <p className="font-semibold text-purple-400">{testimonial.author}</p>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage; 