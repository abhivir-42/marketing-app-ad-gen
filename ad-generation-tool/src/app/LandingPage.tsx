'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// import AudioPlayer from '@/components/AudioPlayer';

// const SAMPLE_AUDIO_FORMATS = {
//   wav: '/audio/sample-coffee-ad.wav',
//   mp3: '/audio/sample-coffee-ad.mp3',
//   ogg: '/audio/sample-coffee-ad.ogg'
// };

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="hero text-center space-y-8 py-20">
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Generate, Iterate & Perfect Your Radio Ads with AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Craft, refine, and produce professional ads—all in one iterative workflow.
          </p>
          <Link 
            href="/script"
            className="inline-block px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Create Your Perfect Ad →
          </Link>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Iterative Design Process</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="hidden md:block absolute left-1/2 top-9 h-[calc(100%-4.5rem)] w-1 bg-purple-600/30 -translate-x-1/2 rounded-full"></div>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
              {[
                {
                  title: 'Create',
                  description: 'Start with your product details and let AI generate a professional script with art direction.',
                  icon: '✨',
                  alignment: 'right',
                  number: 1
                },
                {
                  title: 'Refine',
                  description: 'Easily select parts of your script to refine with AI or edit manually.',
                  icon: '🔄',
                  alignment: 'left',
                  number: 2
                },
                {
                  title: 'Listen',
                  description: 'Convert your script to audio with customizable voice settings.',
                  icon: '🔊',
                  alignment: 'right',
                  number: 3
                },
                {
                  title: 'Compare',
                  description: 'Keep track of all your versions and compare different iterations.',
                  icon: '👁️',
                  alignment: 'left',
                  number: 4
                },
                {
                  title: 'Perfect',
                  description: 'Continue refining both script and audio until it is exactly right.',
                  icon: '🏆',
                  alignment: 'right',
                  number: 5
                },
                {
                  title: 'Export',
                  description: 'Download your finalized audio ad ready for broadcasting.',
                  icon: '⬇️',
                  alignment: 'left',
                  number: 6
                }
              ].map((step, index) => (
                <div key={index} className={`relative ${step.alignment === 'left' ? 'md:col-start-2' : 'md:col-start-1'}`}>
                  {/* Step Number Circle for larger screens */}
                  <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-purple-600 rounded-full items-center justify-center text-white font-bold shadow-lg">
                    {step.number}
                  </div>
                  
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 text-left transform hover:scale-105 transition-all duration-200 border border-purple-900/20 shadow-xl">
                    {/* Step Number for mobile */}
                    <div className="md:hidden flex mb-3 w-8 h-8 bg-purple-600 rounded-full items-center justify-center text-white font-bold">
                      {step.number}
                    </div>
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-purple-400">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features py-20">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose Our Platform</h2>
          <p className="text-xl text-center text-gray-400 mb-12">The ultimate iterative workflow for marketing professionals</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Version History',
                description: 'Track all iterations of your script and audio to compare and restore previous versions.',
                icon: '🕒'
              },
              {
                title: 'Quick AI Refinements',
                description: 'Select any part of your script and let AI suggest improvements with one click.',
                icon: '💡'
              },
              {
                title: 'Voice Customization',
                description: 'Fine-tune speed and pitch to get the perfect delivery for your brand.',
                icon: '🎙️'
              },
              {
                title: 'Audio Comparison',
                description: 'Compare different audio versions to find the perfect voice for your message.',
                icon: '👂'
              },
              {
                title: 'Seamless Iteration',
                description: 'Refine script and audio in the same workspace without context switching.',
                icon: '🔄'
              },
              {
                title: 'Professional Results',
                description: 'Production-ready audio exported in high-quality formats for immediate use.',
                icon: '🌟'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-purple-400">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials py-20">
          <h2 className="text-3xl font-bold text-center mb-12">What Marketing Professionals Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "The iterative workflow has revolutionized our ad creation process. We create better ads in half the time.",
                author: "Sarah Johnson",
                role: "Marketing Director"
              },
              {
                quote: "Being able to compare different iterations side by side is a game-changer for our creative process.",
                author: "Mike Chen",
                role: "Advertising Specialist"
              },
              {
                quote: "I love how I can refine both script and audio without switching between tools. Such a time-saver!",
                author: "Lisa Rodriguez",
                role: "Digital Marketing Manager"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-xl border border-purple-900/20">
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
        
        {/* CTA Section */}
        <section className="cta py-16 text-center">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-12 border border-purple-900/20 shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Create the Perfect Radio Ad?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join marketing professionals who are creating engaging, persuasive radio advertisements in minutes, not days.
            </p>
            <Link 
              href="/script"
              className="inline-block px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start Creating Now →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage; 