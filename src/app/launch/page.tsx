"use client";

import { useState } from "react";
import Image from "next/image";
import { useNetwork } from "@/hooks/useNetwork";
import { useRouter } from "next/navigation";
import { isAddress, createPublicClient, http } from "viem";
import DeployTokenModal from "@/components/DeployTokenModal";
import { Search01Icon, AlertCircleIcon } from "hugeicons-react";

// Basic ERC20 ABI for token validation
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
] as const;

export default function LaunchPage() {
  const router = useRouter();
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
  const [error, setError] = useState<string | null>(null);

  const getNetworkLogo = (networkName: string) => {
    switch (networkName.toLowerCase()) {
      case 'base sepolia':
        return (
          <Image
            src="/assets/logo/base-logo.svg"
            alt="Base Logo"
            width={20}
            height={20}
            className="w-5 h-5 rounded-full"
          />
        );
      case 'optimism sepolia':
        return (
          <Image
            src="/assets/logo/op-logo.svg"
            alt="Optimism Logo"
            width={20}
            height={20}
            className="w-5 h-5 rounded-full"
          />
        );
      case 'sepolia':
        return (
          <Image
            src="/assets/logo/eth-logo.svg"
            alt="Ethereum Logo"
            width={20}
            height={20}
            className="w-5 h-5 rounded-full"
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

  const validateToken = async (address: string) => {
    if (!currentNetwork?.rpcUrl) return false;

    try {
      const publicClient = createPublicClient({
        transport: http(currentNetwork.rpcUrl),
      });

      // Try to call name() function to verify if it's a token
      await publicClient.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'name',
      });

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };

  const handleTokenAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setTokenAddress(address);
    setError(null);
    
    if (isAddress(address)) {
      setIsLoading(true);
      try {
        const isValidToken = await validateToken(address);
        if (isValidToken) {
          router.push(`/token/${address}`);
        } else {
          setError("not_found");
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setError("not_found");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col gap-8">
          <h1 className="text-xl font-semibold text-gray-900 font-plus-jakarta text-center">
            Deploy your multichain token
          </h1>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <div className="relative">
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={handleTokenAddressChange}
                    className={`w-full px-4 py-3 pl-10 border ${
                      error ? 'border-red-200' : 'border-blue-200'
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300`}
                    placeholder="Search for any token address"
                  />
                  <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
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
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                  {currentNetwork && getNetworkLogo(currentNetwork.name)}
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {error === "not_found" && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <AlertCircleIcon className="size-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-900">Token Not Found</h3>
                    <p className="mt-1 text-sm text-red-600">
                      The token address you entered doesn't exist on {currentNetwork?.name}. 
                      Make sure you're on the correct network or try deploying a new token.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-inter shadow-sm hover:shadow-md"
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
    </div>
  );
}
