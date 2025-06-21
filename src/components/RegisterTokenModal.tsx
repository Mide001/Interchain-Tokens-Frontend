import React, { useState } from "react";
import { useNetwork } from "@/hooks/useNetwork";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import Image from "next/image";
import { estimateExistingTokenDeploymentGas } from "interchain-token-sdk";
import { toast } from "sonner";
import { formatEthValue } from "@/utils/format";

interface Network {
  name: string;
  id: number;
  rpcUrl: string;
}

interface RegisterTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  tokenAddress: `0x${string}`;
  currentNetwork: Network | null;
}

type Step = "select" | "review";

const StepIndicator = ({ currentStep }: { currentStep: Step }) => {
  const steps = [
    { id: "select", label: "Select Networks" },
    { id: "review", label: "Review" },
  ];

  return (
    <div className="flex justify-between mb-8 relative px-4">
      <div className="absolute top-[1.25rem] left-[1.25rem] right-[1.25rem] h-0.5 bg-gray-200"></div>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted =
          steps.findIndex((s) => s.id === currentStep) >
          steps.findIndex((s) => s.id === step.id);

        return (
          <div
            key={step.id}
            className="relative z-10 flex flex-col items-center"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                isActive || isCompleted
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {isCompleted ? "✓" : index + 1}
            </div>
            <span
              className={`text-sm font-medium ${
                isActive || isCompleted
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const mapChainNameToSDKFormat = (chainName: string): string => {
  switch (chainName.toLowerCase()) {
    case "base sepolia":
      return "base-sepolia";
    case "optimism sepolia":
      return "optimism-sepolia";
    case "sepolia":
      return "ethereum-sepolia";
    default:
      throw new Error(`Unsupported chain: ${chainName}`);
  }
};

export const RegisterTokenModal: React.FC<RegisterTokenModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tokenAddress,
  currentNetwork,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [selectedChains, setSelectedChains] = useState<number[]>([]);
  const [isEstimatingGas, setIsEstimatingGas] = useState<boolean>(false);
  const [gasEstimates, setGasEstimates] = useState<Record<number, bigint>>({});
  const { price: ethPrice, isLoading: isPriceLoading } = useTokenPrice();
  const { balance, isLoading: isBalanceLoading } = useWalletBalance();
  const { supportedNetworks } = useNetwork();

  // Calculate total gas cost in ETH and USD
  const totalGasInEth = Object.values(gasEstimates).reduce((sum, gas) => sum + Number(gas) / 1e18, 0);
  const totalGasInUsd = totalGasInEth * ethPrice;

  // Check if user has sufficient balance
  const hasSufficientBalance = Number(balance) >= totalGasInEth;

  if (!isOpen) return null;

  const availableNetworks = supportedNetworks.filter(
    (network) => network.id !== currentNetwork?.id
  );

  const handleChainSelection = async (chainId: number) => {
    const isCurrentlySelected = selectedChains.includes(chainId);
    const newSelectedChains = isCurrentlySelected
      ? selectedChains.filter((id) => id !== chainId)
      : [...selectedChains, chainId];

    setSelectedChains(newSelectedChains);

    // If we're deselecting a chain, remove its gas estimate
    if (isCurrentlySelected) {
      setGasEstimates((prev) => {
        const newEstimates = { ...prev };
        delete newEstimates[chainId];
        return newEstimates;
      });
      return;
    }

    // If we're adding a chain, estimate gas
    const network = supportedNetworks.find((n) => n.id === chainId);
    if (!network || !currentNetwork) return;

    try {
      setIsEstimatingGas(true);
      const gasEstimate = await estimateExistingTokenDeploymentGas(
        mapChainNameToSDKFormat(currentNetwork.name),
        mapChainNameToSDKFormat(network.name),
        tokenAddress as `0x${string}`
      );
      
      setGasEstimates((prev) => ({
        ...prev,
        [chainId]: gasEstimate,
      }));

      // Show toast with gas estimate
      const gasInEth = Number(gasEstimate) / 1e18;
      toast.success(`Estimated gas for ${network.name}: ${formatEthValue(gasInEth)} ETH`);
    } catch (error) {
      console.error("Error estimating gas:", error);
      toast.error(`Failed to estimate gas for ${network.name}`);
      setSelectedChains(prev => prev.filter(id => id !== chainId));
      setGasEstimates(prev => {
        const newEstimates = { ...prev };
        delete newEstimates[chainId];
        return newEstimates;
      });
    } finally {
      setIsEstimatingGas(false);
    }
  };

  const handleNext = () => {
    if (currentStep === "select") {
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    if (currentStep === "review") {
      setCurrentStep("select");
    }
  };

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

  const renderStepContent = () => {
    switch (currentStep) {
      case "select":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Select networks to register your token on
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableNetworks.map((network) => {
                  const isSelected = selectedChains.includes(network.id);
                  const gasEstimate = gasEstimates[network.id];
                  const isEstimating = isEstimatingGas && isSelected;

                  return (
                    <div
                      key={network.id}
                      onClick={() => !isEstimatingGas && handleChainSelection(network.id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "border-blue-500 bg-white"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                      } ${isEstimatingGas ? "cursor-not-allowed" : ""}`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Image
                            src={getNetworkLogo(network.name)}
                            alt={network.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full"
                          />
                          {isEstimating && (
                            <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{network.name}</h4>
                          {isSelected && gasEstimate && (
                            <p className="text-sm text-gray-500 mt-1">
                              {formatEthValue(Number(gasEstimate) / 1e18)} ETH
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedChains.length > 0 && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total Cost</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatEthValue(totalGasInEth)} ETH
                        {!isPriceLoading && (
                          <span className="ml-2 text-xs text-gray-400">
                            (${totalGasInUsd.toFixed(2)})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Balance: {isBalanceLoading || isPriceLoading
                          ? "Loading..."
                          : `$${(Number(balance) * ethPrice).toFixed(2)}`}
                        {!hasSufficientBalance && (
                          <span className="text-red-500 ml-1">
                            (Insufficient)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "review":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Token Address
              </h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-mono text-gray-900 break-all">
                  {tokenAddress}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Registration Networks
              </h3>
              <div className="flex items-center space-x-4">
                {/* Primary network */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Image
                      src={getNetworkLogo(currentNetwork?.name || "")}
                      alt={currentNetwork?.name || ""}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-white font-bold">✓</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {currentNetwork?.name}
                  </span>
                </div>
                
                {/* Arrow */}
                <div className="text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                
                {/* Overlapping network logos */}
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {selectedChains.map((chainId, index) => {
                      const network = supportedNetworks.find((n) => n.id === chainId);
                      if (!network) return null;
                      return (
                        <div
                          key={chainId}
                          className="relative"
                          style={{ zIndex: selectedChains.length - index }}
                        >
                          <Image
                            src={getNetworkLogo(network.name)}
                            alt={network.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform duration-200"
                            title={network.name}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {selectedChains.length > 0 && (
                    <span className="ml-3 text-sm text-gray-500">
                      +{selectedChains.length} networks
                    </span>
                  )}
                </div>
              </div>
              
              {/* Gas cost summary */}
              {selectedChains.length > 0 && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total Gas Cost:</span>
                    <span className="text-sm text-gray-500">
                      {formatEthValue(totalGasInEth)} ETH
                      {!isPriceLoading && (
                        <span className="ml-2 text-xs text-gray-400">
                          (${totalGasInUsd.toFixed(2)})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 font-plus-jakarta text-center w-full">
            Register token on multiple chains
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 absolute right-8"
          >
            ✕
          </button>
        </div>

        <StepIndicator currentStep={currentStep} />

        <form onSubmit={onSubmit} className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-6">
            {currentStep !== "select" ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 font-inter"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 font-inter"
              >
                Cancel
              </button>
            )}

            {currentStep !== "review" ? (
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedChains.length === 0 || !hasSufficientBalance}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 font-inter shadow-sm hover:shadow-md ${
                    selectedChains.length === 0 || !hasSufficientBalance
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                  }`}
                >
                  Next
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!hasSufficientBalance}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 font-inter shadow-sm hover:shadow-md ${
                  !hasSufficientBalance
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                }`}
              >
                Register Token
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterTokenModal; 