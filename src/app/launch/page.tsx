"use client";

import { useState } from "react";
import Image from "next/image";

export default function LaunchPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("sepolia");
  const [formData, setFormData] = useState({
    tokenName: "",
    tokenSymbol: "",
    decimals: "18",
    totalSupply: "",
  });

  const networks = [
    { 
      id: "sepolia", 
      name: "Sepolia",
      logo: (
        <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#627EEA"/>
          <path d="M16.498 4V12.87L23.995 16.22L16.498 4Z" fill="#C0CBF6"/>
          <path d="M16.498 4L9 16.22L16.498 12.87V4Z" fill="white"/>
          <path d="M16.498 21.968V27.995L24 17.616L16.498 21.968Z" fill="#C0CBF6"/>
          <path d="M16.498 27.995V21.967L9 17.616L16.498 27.995Z" fill="white"/>
          <path d="M16.498 20.573L23.995 16.22L16.498 12.872V20.573Z" fill="#8197EE"/>
          <path d="M9 16.22L16.498 20.573V12.872L9 16.22Z" fill="#C0CBF6"/>
        </svg>
      )
    },
    { 
      id: "base-sepolia", 
      name: "Base Sepolia",
      logo: (
        <Image
          src="/assets/logo/base-logo.svg"
          alt="Base Logo"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      )
    },
    { 
      id: "optimism-sepolia", 
      name: "Optimism Sepolia",
      logo: (
        <Image
          src="/assets/logo/op-logo.svg"
          alt="Optimism Logo"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      )
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col gap-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-plus-jakarta text-center">
            Deploy your multichain token
          </h1>

          <div className="flex gap-4">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition-all duration-200 hover:border-gray-300"
              placeholder="Search for any token address"
            />
            <div className="relative w-48">
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 hover:border-gray-300 appearance-none"
              >
                {networks.map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {networks.find(n => n.id === selectedNetwork)?.logo}
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-400 font-medium font-inter">OR</span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-inter shadow-sm hover:shadow-md"
          >
            Deploy new token
          </button>
        </div>
      </div>

      {/* Deploy Token Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-plus-jakarta">
                Deploy token on {networks.find(n => n.id === selectedNetwork)?.name}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-inter">
                    Token Name
                  </label>
                  <input
                    type="text"
                    name="tokenName"
                    value={formData.tokenName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="e.g., MyToken"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-inter">
                    Token Symbol
                  </label>
                  <input
                    type="text"
                    name="tokenSymbol"
                    value={formData.tokenSymbol}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="e.g., MTK"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-inter">
                    Decimals
                  </label>
                  <input
                    type="number"
                    name="decimals"
                    value={formData.decimals}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="e.g., 18"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-inter">
                    Total Supply
                  </label>
                  <input
                    type="number"
                    name="totalSupply"
                    value={formData.totalSupply}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="e.g., 1000000"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 font-inter"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-inter shadow-sm hover:shadow-md"
                >
                  Register and Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
