"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useNetwork } from "@/hooks/useNetwork";
import { createPublicClient, http, parseAbi } from "viem";
import Link from "next/link";
import { PiCheck } from "react-icons/pi";
import { Copy01Icon, ArrowUpRight01Icon } from "hugeicons-react";
import Image from "next/image";
import RegisterTokenModal from "@/components/RegisterTokenModal";

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}

const erc20Abi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
]);

const getExplorerInfo = (networkName: string) => {
  switch (networkName.toLowerCase()) {
    case "base sepolia":
      return {
        name: "Basescan",
        url: "https://sepolia.basescan.org",
        logo: "/assets/logo/base-logo.svg",
      };
    case "optimism sepolia":
      return {
        name: "Optimism Explorer",
        url: "https://sepolia-optimism.etherscan.io",
        logo: "/assets/logo/op-logo.svg",
      };
    case "sepolia":
      return {
        name: "Etherscan",
        url: "https://sepolia.etherscan.io",
        logo: "/assets/logo/eth-logo.svg",
      };
    default:
      return {
        name: "Explorer",
        url: "#",
        logo: "/assets/logo/eth-logo.svg",
      };
  }
};

export default function TokenPage() {
  const params = useParams();
  const { currentNetwork } = useNetwork();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(params.address as string);
    setIsAddressCopied(true);
    setTimeout(() => setIsAddressCopied(false), 2000);
  };

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!currentNetwork?.rpcUrl || !params.address) return;

      try {
        setIsLoading(true);
        setError(null);

        const publicClient = createPublicClient({
          transport: http(currentNetwork.rpcUrl),
        });

        const [name, symbol, decimals] = await Promise.all([
          publicClient.readContract({
            address: params.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "name",
          }),
          publicClient.readContract({
            address: params.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "symbol",
          }),
          publicClient.readContract({
            address: params.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "decimals",
          }),
        ]);

        setTokenInfo({
          name: name as string,
          symbol: symbol as string,
          decimals: Number(decimals),
        });
      } catch (err) {
        setError(
          "Failed to fetch token information. Please check the address and try again."
        );
        console.error("Error fetching token info:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenInfo();
  }, [params.address, currentNetwork]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement token registration logic
    console.log("Registering token:", params.address);
    setIsRegisterModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-500 font-medium">{error}</div>
      </div>
    );
  }

  if (!tokenInfo) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Token Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">{tokenInfo.name}</h1>
          <p className="text-xl text-gray-600 -mt-1">{tokenInfo.symbol}</p>
        </div>

        {/* Token Details */}
        <div className="space-y-4 text-left max-w-md">
          <div className="space-y-2">
            <p className="text-gray-600">
              Name: <span className="text-gray-900">{tokenInfo.name}</span>
            </p>
            <p className="text-gray-600">
              Symbol: <span className="text-gray-900">{tokenInfo.symbol}</span>
            </p>
            <p className="text-gray-600">
              Decimals:{" "}
              <span className="text-gray-900">{tokenInfo.decimals}</span>
            </p>
            <div className="flex items-center gap-2">
              <p className="text-gray-600">
                Token Address:{" "}
                <span className="text-gray-900 font-mono">
                  {truncateAddress(params.address as string)}
                </span>
              </p>
              <button
                onClick={handleCopyAddress}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title="Copy address"
              >
                {isAddressCopied ? (
                  <PiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy01Icon className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
            <p className="text-gray-600">
              Add Token to wallet:{" "}
              <Link
                href="#"
                className="text-blue-600 hover:text-blue-700 underline decoration-1 underline-offset-4"
              >
                Add
              </Link>
            </p>
          </div>
        </div>

        {/* Explorer Link */}
        {currentNetwork && (
          <div className="flex justify-end">
            <Link
              href={`${getExplorerInfo(currentNetwork.name).url}/address/${
                params.address
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all duration-200"
            >
              <Image
                src={getExplorerInfo(currentNetwork.name).logo}
                alt={`${getExplorerInfo(currentNetwork.name).name} logo`}
                width={16}
                height={16}
                className="w-4 h-4"
              />
              <span className="font-semibold">
                View token on {getExplorerInfo(currentNetwork.name).name}
              </span>
              <ArrowUpRight01Icon className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Register Button */}
        <div className="flex justify-center pt-8">
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Register Token Multichain
          </button>
        </div>
      </div>

      {/* Register Token Modal */}
      <RegisterTokenModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterSubmit}
        tokenAddress={params.address as `0x${string}`}
        currentNetwork={currentNetwork}
      />
    </div>
  );
}

const getNetworkLogo = (networkName: string) => {
  switch (networkName.toLowerCase()) {
    case "base sepolia":
      return "/assets/logo/base-logo.svg";
    case "optimism sepolia":
      return "/assets/logo/op-logo.svg";
    case "sepolia":
      return "/assets/logo/eth-logo.svg";
    default:
      return "/assets/logo/eth-logo.svg";
  }
};
