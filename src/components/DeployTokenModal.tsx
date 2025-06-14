import React, { useState } from "react";
import { useNetwork } from "@/hooks/useNetwork";
import Image from "next/image";

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
  currentNetwork: { name: string; id: number } | null;
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
        const isCompleted = steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id);
        
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              isActive ? "bg-blue-600 text-white" : 
              isCompleted ? "bg-green-500 text-white" : 
              "bg-gray-200 text-gray-600"
            }`}>
              {isCompleted ? "✓" : index + 1}
            </div>
            <span className={`text-sm font-medium ${
              isActive ? "text-blue-600" : 
              isCompleted ? "text-green-500" : 
              "text-gray-500"
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
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
  const { supportedNetworks } = useNetwork();

  if (!isOpen) return null;

  const availableNetworks = supportedNetworks.filter(
    network => network.id !== currentNetwork?.id
  );

  const handleChainSelection = (chainId: number) => {
    setSelectedChains(prev => 
      prev.includes(chainId)
        ? prev.filter(id => id !== chainId)
        : [...prev, chainId]
    );
  };

  const handleNext = () => {
    if (currentStep === "details") {
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
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
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
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
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
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
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
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 placeholder:font-semibold text-gray-900 transition-all duration-200 hover:border-blue-300"
                placeholder="e.g., 1000000"
                required
              />
            </div>
          </div>
        );
      case "deploy":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Select additional networks to deploy to:</h3>
              <div className="space-y-3">
                {availableNetworks.map((network) => (
                  <label
                    key={network.id}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChains.includes(network.id)}
                      onChange={() => handleChainSelection(network.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      <Image
                        src={getNetworkLogo(network.name)}
                        alt={network.name}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium text-gray-900">{network.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case "review":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Token Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Token Name</p>
                  <p className="font-medium text-gray-900">{formData.tokenName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Token Symbol</p>
                  <p className="font-medium text-gray-900">{formData.tokenSymbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Decimals</p>
                  <p className="font-medium text-gray-900">{formData.decimals}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Supply</p>
                  <p className="font-medium text-gray-900">{formData.totalSupply}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Deployment Networks</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200">
                  <Image
                    src={getNetworkLogo(currentNetwork?.name || "")}
                    alt={currentNetwork?.name || ""}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-900">{currentNetwork?.name} (Primary)</span>
                </div>
                {selectedChains.map((chainId) => {
                  const network = supportedNetworks.find(n => n.id === chainId);
                  if (!network) return null;
                  return (
                    <div key={chainId} className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200">
                      <Image
                        src={getNetworkLogo(network.name)}
                        alt={network.name}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium text-gray-900">{network.name}</span>
                    </div>
                  );
                })}
              </div>
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
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-inter shadow-sm hover:shadow-md"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-inter shadow-sm hover:shadow-md"
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
