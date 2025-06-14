"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useNetwork } from "@/hooks/useNetwork";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import DeployTokenModal from "@/components/DeployTokenModal";
import NetworkDropdown from "@/components/ui/NetworkDropdown";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function LaunchPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentNetwork, supportedNetworks } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [formData, setFormData] = useState({
    tokenName: "",
    tokenSymbol: "",
    decimals: "18",
    totalSupply: "",
  });

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading skeleton until mounted
  if (!mounted) {
    return <LoadingSkeleton />;
  }

  const getNetworkLogo = (networkName: string) => {
    switch (networkName.toLowerCase()) {
      case 'base sepolia':
        return (
          <Image
            src="/assets/logo/base-logo.svg"
            alt="Base Logo"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        );
      case 'optimism sepolia':
        return (
          <Image
            src="/assets/logo/op-logo.svg"
            alt="Optimism Logo"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        );
      case 'sepolia':
        return (
          <Image
            src="/assets/logo/eth-logo.svg"
            alt="Ethereum Logo"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        );
      default:
        return null;
    }
  };

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

  const handleTokenAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setTokenAddress(address);
    
    if (isAddress(address)) {
      setIsLoading(true);
      // Simulate a small delay for the loading animation
      setTimeout(() => {
        setIsLoading(false);
        router.push(`/token/${address}`);
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
      {/* Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col gap-6 sm:gap-8">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 font-plus-jakarta text-center">
            Deploy your multichain token
          </h1>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={tokenAddress}
                onChange={handleTokenAddressChange}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
                placeholder="Search for any token address"
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </div>
            <div className="relative w-48">
              <select
                value={currentNetwork?.id || ''}
                className="w-full px-4 py-3 pl-10 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-semibold text-sm transition-all duration-200 hover:border-blue-300 appearance-none"
                disabled
              >
                {supportedNetworks.map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {currentNetwork && getNetworkLogo(currentNetwork.name)}
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
          {/* Mobile Search Layout */}
          <div className="block sm:hidden space-y-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-inter shadow-sm hover:shadow-md text-lg"
            >
              Deploy New Token
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-400 font-medium font-inter">OR</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-full">
                <NetworkDropdown
                  networks={networks}
                  selectedNetwork={selectedNetwork}
                  onNetworkChange={setSelectedNetwork}
                />
              </div>
              <input
                type="text"
                className="w-full px-4 py-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
                placeholder="Search for any token address"
              />
            </div>
          </div>

          {/* Desktop Search Layout */}
          <div className="hidden sm:flex gap-4">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
              placeholder="Search for any token address"
            />
            <div className="w-auto">
              <NetworkDropdown
                networks={networks}
                selectedNetwork={selectedNetwork}
                onNetworkChange={setSelectedNetwork}
              />
            </div>
          </div>

          {/* Desktop OR Separator */}
          <div className="hidden sm:block relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-400 font-medium font-inter">OR</span>
            </div>
          </div>

          {/* Desktop Deploy Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-inter shadow-sm hover:shadow-md"
          >
            Deploy New Token
          </button>
        </div>
      </div>

      {/* Deploy Token Modal */}
      <DeployTokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        currentNetwork={currentNetwork}
      />
      {/* Deploy Token Modal - Bottom Sheet on Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div 
            className={`
              bg-white rounded-t-[20px] sm:rounded-xl w-full sm:max-w-2xl mx-auto 
              p-4 sm:p-6 lg:p-8 shadow-xl relative max-h-[90vh] overflow-y-auto
              transform transition-transform duration-300 ease-out
              translate-y-0 sm:translate-y-0
            `}
          >
            {/* Mobile Pull Indicator */}
            <div className="block sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
            
            <div className="flex justify-between items-center mb-6 sm:mb-8 sticky top-0 bg-white pb-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 font-plus-jakarta pr-8">
                Deploy token on {networks.find(n => n.id === selectedNetwork)?.name}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 absolute right-4 sm:right-6 lg:right-8 top-4 sm:top-6 lg:top-8"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 font-inter">
                    Token Name
                  </label>
                  <input
                    type="text"
                    name="tokenName"
                    value={formData.tokenName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 sm:py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
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
                    className="w-full px-4 py-4 sm:py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
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
                    className="w-full px-4 py-4 sm:py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
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
                    className="w-full px-4 py-4 sm:py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
                    placeholder="e.g., 1000000"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t">
                <button
                  type="submit"
                  className="w-full px-6 py-4 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-inter shadow-sm hover:shadow-md text-lg sm:text-base"
                >
                  Register & Deploy
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-6 py-4 sm:py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 font-inter text-lg sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
