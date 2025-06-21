import React, { useState, useEffect } from "react";
import { useNetwork } from "@/hooks/useNetwork";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import Image from "next/image";
import { estimateNewTokenDeploymentGas } from "interchain-token-sdk";
import { toast } from "sonner";

interface Network {
  name: string;
  id: number;
  rpcUrl: string;
}

interface DeployTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    tokenName: string;
    tokenSymbol: string;
    decimals: string;
    totalSupply: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentNetwork: Network | null;
}

type Step = "details" | "deploy" | "review";

const StepIndicator = ({ currentStep }: { currentStep: Step }) => {
  const steps = [
    { id: "details", label: "Token Details" },
    { id: "deploy", label: "Register & Deploy" },
    { id: "review", label: "Review" },
  ];

  return (
    <div className="flex justify-between mb-8 relative px-4">
      {/* Single continuous line */}
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
                isActive || isCompleted ? "text-blue-600" : "text-gray-500"
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

const formatEthValue = (value: number): string => {
  if (value === 0) return "0";

  // Convert to scientific notation to find the first non-zero digit
  const scientific = value.toExponential();
  const [, exponent] = scientific.split("e");
  const exp = parseInt(exponent);

  // Calculate how many decimal places we need
  const decimalPlaces = Math.max(0, -exp + 1);

  // Format with exactly 2 significant digits after the first non-zero
  return value.toFixed(decimalPlaces + 1);
};

export const DeployTokenModal: React.FC<DeployTokenModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  currentNetwork,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [selectedChains, setSelectedChains] = useState<number[]>([]);
  const [isEstimatingGas, setIsEstimatingGas] = useState<boolean>(false);
  const [gasEstimates, setGasEstimates] = useState<Record<number, bigint>>({});
  const { price: ethPrice, isLoading: isPriceLoading } = useTokenPrice();
  const { balance, isLoading: isBalanceLoading } = useWalletBalance();
  const { supportedNetworks } = useNetwork();

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Validation function
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Token name validation
    if (!formData.tokenName.trim())
      newErrors.tokenName = "Token name is required.";

    // Token symbol validation
    if (!formData.tokenSymbol.trim())
      newErrors.tokenSymbol = "Token symbol is required.";

    // Decimals validation
    if (!formData.decimals.trim()) {
      newErrors.decimals = "Decimals is required.";
    } else {
      const decimals = Number(formData.decimals);
      if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) {
        newErrors.decimals = "Decimals must be an integer between 0 and 36.";
      }
    }

    // Total supply validation
    if (!formData.totalSupply.trim()) {
      newErrors.totalSupply = "Total supply is required.";
    } else {
      const totalSupply = Number(formData.totalSupply);
      if (isNaN(totalSupply) || totalSupply <= 0) {
        newErrors.totalSupply = "Total supply must be a positive number.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if field has format error (invalid characters)
  const hasFormatError = (fieldName: string) => {
    if (fieldName === "decimals") {
      return (
        formData.decimals.trim() !== "" && !/^\d+$/.test(formData.decimals)
      );
    }
    if (fieldName === "totalSupply") {
      return (
        formData.totalSupply.trim() !== "" &&
        !/^\d+(\.\d+)?$/.test(formData.totalSupply)
      );
    }
    return false;
  };

  // Check if field should show error (either format error or validation error after touched)
  const shouldShowError = (fieldName: string) => {
    return (
      hasFormatError(fieldName) || (errors[fieldName] && touched[fieldName])
    );
  };

  // Handle input change with number validation
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only allow numbers for decimals and total supply
    if (name === "decimals") {
      if (value === "" || /^\d*$/.test(value)) {
        onInputChange(e);
      }
    } else if (name === "totalSupply") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        onInputChange(e);
      }
    } else {
      onInputChange(e);
    }
  };

  // Real-time validation effect
  useEffect(() => {
    if (currentStep === "details") {
      validate();
    }
  }, [formData, currentStep]);

  // Check if all required fields are filled
  const isDetailsValid = () => {
    return (
      formData.tokenName.trim() !== "" &&
      formData.tokenSymbol.trim() !== "" &&
      formData.decimals.trim() !== "" &&
      formData.totalSupply.trim() !== "" &&
      Object.keys(errors).length === 0
    );
  };

  // Calculate total gas cost in ETH and USD
  const totalGasInEth = Object.values(gasEstimates).reduce(
    (sum, gas) => sum + Number(gas) / 1e18,
    0
  );
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
      return; // Exit early since we don't need to estimate gas for deselection
    }

    // If we're adding a chain, estimate gas
    const network = supportedNetworks.find((n) => n.id === chainId);
    if (!network || !currentNetwork) return;

    try {
      setIsEstimatingGas(true);
      const gasEstimate = await estimateNewTokenDeploymentGas(
        mapChainNameToSDKFormat(currentNetwork.name),
        mapChainNameToSDKFormat(network.name)
      );

      setGasEstimates((prev) => ({
        ...prev,
        [chainId]: gasEstimate,
      }));

      // Show toast with gas estimate
      const gasInEth = Number(gasEstimate) / 1e18;
      toast.success(
        `Estimated gas for ${network.name}: ${formatEthValue(gasInEth)} ETH`
      );
    } catch (error) {
      console.error("Error estimating gas:", error);
      toast.error(`Failed to estimate gas for ${network.name}`);
      // Remove the chain from selection if gas estimation fails
      setSelectedChains((prev) => prev.filter((id) => id !== chainId));
      // Also remove any existing gas estimate for this chain
      setGasEstimates((prev) => {
        const newEstimates = { ...prev };
        delete newEstimates[chainId];
        return newEstimates;
      });
    } finally {
      setIsEstimatingGas(false);
    }
  };

  const handleNext = () => {
    if (currentStep === "details") {
      if (!validate()) return;
      setCurrentStep("deploy");
    } else if (currentStep === "deploy") {
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    if (currentStep === "deploy") {
      setCurrentStep("details");
    } else if (currentStep === "review") {
      setCurrentStep("deploy");
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
      case "details":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 font-inter">
                Token Name
              </label>
              <input
                type="text"
                name="tokenName"
                value={formData.tokenName}
                onChange={onInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300 ${
                  shouldShowError("tokenName")
                    ? "border-red-400"
                    : "border-blue-200"
                }`}
                placeholder="e.g., MyToken"
                required
                onBlur={(e) => {
                  onInputChange(e);
                  handleFieldBlur("tokenName");
                }}
              />
              {shouldShowError("tokenName") && (
                <p className="text-xs text-red-500 mt-1">{errors.tokenName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 font-inter">
                Token Symbol
              </label>
              <input
                type="text"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={onInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300 ${
                  shouldShowError("tokenSymbol")
                    ? "border-red-400"
                    : "border-blue-200"
                }`}
                placeholder="e.g., MTK"
                required
                onBlur={(e) => {
                  onInputChange(e);
                  handleFieldBlur("tokenSymbol");
                }}
              />
              {shouldShowError("tokenSymbol") && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.tokenSymbol}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 font-inter">
                Decimals
              </label>
              <input
                type="number"
                name="decimals"
                value={formData.decimals}
                onChange={handleNumberInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300 ${
                  shouldShowError("decimals")
                    ? "border-red-400"
                    : "border-blue-200"
                }`}
                placeholder="e.g., 18"
                required
                onBlur={(e) => {
                  onInputChange(e);
                  handleFieldBlur("decimals");
                }}
              />
              {shouldShowError("decimals") && (
                <p className="text-xs text-red-500 mt-1">
                  {hasFormatError("decimals")
                    ? "Please enter only numbers"
                    : errors.decimals}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 font-inter">
                Total Supply
              </label>
              <input
                type="number"
                name="totalSupply"
                value={formData.totalSupply}
                onChange={handleNumberInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300 ${
                  shouldShowError("totalSupply")
                    ? "border-red-400"
                    : "border-blue-200"
                }`}
                placeholder="e.g., 1000000"
                required
                onBlur={(e) => {
                  onInputChange(e);
                  handleFieldBlur("totalSupply");
                }}
              />
              {shouldShowError("totalSupply") && (
                <p className="text-xs text-red-500 mt-1">
                  {hasFormatError("totalSupply")
                    ? "Please enter only numbers"
                    : errors.totalSupply}
                </p>
              )}
            </div>
          </div>
        );
      case "deploy":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Select additional networks to deploy to
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
                Token Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Token Name</p>
                  <p className="font-medium text-gray-900">
                    {formData.tokenName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Token Symbol</p>
                  <p className="font-medium text-gray-900">
                    {formData.tokenSymbol}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Decimals</p>
                  <p className="font-medium text-gray-900">
                    {formData.decimals}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Supply</p>
                  <p className="font-medium text-gray-900">
                    {formData.totalSupply}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Deployment Networks
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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Overlapping network logos */}
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {selectedChains.map((chainId, index) => {
                      const network = supportedNetworks.find(
                        (n) => n.id === chainId
                      );
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
            </div>
          </div>
        );
    }
  };

  // Handle field blur to mark as touched
  const handleFieldBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 font-plus-jakarta text-center w-full">
            Deploy token on {currentNetwork?.name}
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
            {currentStep !== "details" ? (
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
                  disabled={
                    currentStep === "details"
                      ? !isDetailsValid()
                      : currentStep === "deploy" && !hasSufficientBalance
                  }
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 font-inter shadow-sm hover:shadow-md ${
                    currentStep === "details"
                      ? !isDetailsValid()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                      : currentStep === "deploy" && !hasSufficientBalance
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
                Deploy Token
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeployTokenModal;
