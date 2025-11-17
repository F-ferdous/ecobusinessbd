'use client';

import React from 'react';

const AmazonCourseSection = () => {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="scroll-animate">
            <div className="mb-6">
              <span className="inline-block bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                🚀 New Course Launch
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Master 
                <span className="relative inline-block mx-2">
                  <span className="amazon-text">Amazon</span>
                  <div className="amazon-smile"></div>
                </span>
                FBA Business
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                From zero to six-figure seller! Learn the proven strategies that have helped thousands 
                of entrepreneurs build successful Amazon businesses. Get exclusive insider knowledge 
                and step-by-step guidance.
              </p>
            </div>

            {/* Course Benefits */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Product Research</h4>
                  <p className="text-gray-600 text-sm">Find winning products</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Supplier Sourcing</h4>
                  <p className="text-gray-600 text-sm">Connect with manufacturers</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Amazon PPC</h4>
                  <p className="text-gray-600 text-sm">Master advertising strategies</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Brand Building</h4>
                  <p className="text-gray-600 text-sm">Scale to 7-figure business</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/amazon-courses"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-lg text-center transition-colors duration-200"
              >
                Enroll Now - $197
              </a>
              <a
                href="/amazon-courses"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold rounded-lg text-center transition-colors duration-200"
              >
                View Course Details
              </a>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">2,500+</div>
                <div className="text-xs text-gray-500">Students Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4.9★</div>
                <div className="text-xs text-gray-500">Course Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">$50K+</div>
                <div className="text-xs text-gray-500">Avg. Student Revenue</div>
              </div>
            </div>
          </div>

          {/* Right Animation Section */}
          <div className="relative scroll-animate">
            <div className="amazon-animation-container">
              {/* Main Amazon-style Logo */}
              <div className="amazon-logo-wrapper">
                <div className="amazon-logo">
                  <span className="amazon-a">amazon</span>
                  <div className="amazon-arrow-smile"></div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="floating-elements">
                <div className="floating-box box-1">
                  <div className="text-xs font-semibold text-orange-600">Product Research</div>
                </div>
                <div className="floating-box box-2">
                  <div className="text-xs font-semibold text-blue-600">PPC Mastery</div>
                </div>
                <div className="floating-box box-3">
                  <div className="text-xs font-semibold text-green-600">Brand Building</div>
                </div>
              </div>

              {/* Success Metrics */}
              <div className="success-metrics">
                <div className="metric-card metric-1">
                  <div className="text-lg font-bold text-green-600">$10K/mo</div>
                  <div className="text-xs text-gray-600">Revenue Goal</div>
                </div>
                <div className="metric-card metric-2">
                  <div className="text-lg font-bold text-blue-600">90 Days</div>
                  <div className="text-xs text-gray-600">To Launch</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AmazonCourseSection;