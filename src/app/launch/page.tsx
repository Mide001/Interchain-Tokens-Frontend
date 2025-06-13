'use client';

import { useState } from 'react';

export default function LaunchPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`w-24 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Token Details</span>
          <span>Tokenomics</span>
          <span>Security</span>
          <span>Review</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-plus-jakarta">Token Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 font-inter">
                  Token Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., MyToken"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 font-inter">
                  Token Symbol
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., MTK"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 font-inter">
                  Token Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe your token's purpose and utility..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-plus-jakarta">Tokenomics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 font-inter">
                  Total Supply
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1000000"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 font-inter">
                  Decimals
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 18"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 font-inter">
                  Initial Price (ETH)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 0.001"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-plus-jakarta">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700 font-inter">
                  Enable minting after deployment
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700 font-inter">
                  Enable burning functionality
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700 font-inter">
                  Enable pausing functionality
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-plus-jakarta">Review & Deploy</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Token Name:</span>
                <span className="font-medium font-inter">MyToken</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Token Symbol:</span>
                <span className="font-medium font-inter">MTK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Total Supply:</span>
                <span className="font-medium font-inter">1,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Decimals:</span>
                <span className="font-medium font-inter">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Initial Price:</span>
                <span className="font-medium font-inter">0.001 ETH</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 font-inter"
            >
              Back
            </button>
          )}
          <button
            onClick={() => step < 4 ? setStep(step + 1) : null}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 font-inter ${
              step === 1 ? 'ml-auto' : ''
            }`}
          >
            {step === 4 ? 'Deploy Token' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 