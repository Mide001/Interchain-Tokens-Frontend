import { useState } from "react";
import Image from "next/image";
import { useNetwork } from "@/hooks/useNetwork";

export const NetworkSwitcher = () => {
  const { currentNetwork, switchNetwork, isLoading, supportedNetworks } =
    useNetwork();
  const [isOpen, setIsOpen] = useState(false);

  const handleNetworkSwitch = async (
    network: (typeof supportedNetworks)[0]
  ) => {
    try {
      await switchNetwork(network);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  const getNetworkLogo = (networkName: string) => {
    switch (networkName.toLowerCase()) {
      case "base sepolia":
        return (
          <Image
            src="/assets/logo/base-logo.svg"
            alt="Base Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        );
      case "optimism sepolia":
        return (
          <Image
            src="/assets/logo/op-logo.svg"
            alt="Optimism Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        );
      case "sepolia":
        return (
          <Image
            src="/assets/logo/eth-logo.svg"
            alt="Ethereum Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
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
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {getNetworkLogo(currentNetwork.name)}{" "}
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
                } transition-colors duration-150`}
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
