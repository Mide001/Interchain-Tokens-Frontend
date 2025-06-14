import { useState } from "react";
import Image from "next/image";
import { useNetwork } from "@/hooks/useNetwork";

export const NetworkSwitcher = () => {
  const { currentNetwork, switchNetwork, isLoading, supportedNetworks } =
    useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingImage, setLoadingImage] = useState<string | null>(null);

  const handleNetworkSwitch = async (
    network: (typeof supportedNetworks)[0]
  ) => {
    try {
      setLoadingImage(network.name);
      await switchNetwork(network);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to switch network:", error);
    } finally {
      setLoadingImage(null);
    }
  };

  const getNetworkLogo = (networkName: string) => {
    const isImageLoading = loadingImage === networkName;

    switch (networkName.toLowerCase()) {
      case "base sepolia":
        return (
          <div className="w-5 h-5 relative">
            <Image
              src="/assets/logo/base-logo.svg"
              alt="Base Logo"
              width={20}
              height={20}
              className={`w-5 h-5 transition-all duration-200 ${
                isImageLoading ? 'blur-sm opacity-50' : 'blur-0 opacity-100'
              }`}
              loading="lazy"
            />
          </div>
        );
      case "optimism sepolia":
        return (
          <div className="w-5 h-5 relative">
            <Image
              src="/assets/logo/op-logo.svg"
              alt="Optimism Logo"
              width={20}
              height={20}
              className={`w-5 h-5 transition-all duration-200 ${
                isImageLoading ? 'blur-sm opacity-50' : 'blur-0 opacity-100'
              }`}
              loading="lazy"
            />
          </div>
        );
      case "sepolia":
        return (
          <div className="w-5 h-5 relative">
            <Image
              src="/assets/logo/eth-logo.svg"
              alt="Ethereum Logo"
              width={20}
              height={20}
              className={`w-5 h-5 transition-all duration-200 ${
                isImageLoading ? 'blur-sm opacity-50' : 'blur-0 opacity-100'
              }`}
              loading="lazy"
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (!currentNetwork) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        {getNetworkLogo(currentNetwork.name)}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-16 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {supportedNetworks.map((network) => (
              <button
                key={network.id}
                onClick={() => handleNetworkSwitch(network)}
                disabled={isLoading}
                className={`w-full p-2 flex items-center justify-center ${
                  currentNetwork.id === network.id
                    ? "bg-gray-50"
                    : "hover:bg-gray-50"
                } transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed`}
                role="menuitem"
              >
                {getNetworkLogo(network.name)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
