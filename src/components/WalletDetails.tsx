"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion, Transition } from "framer-motion";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNetwork } from "@/hooks/useNetwork";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import Image from "next/image";
import { PiCheck } from "react-icons/pi";
import { Copy01Icon, Wallet01Icon, ArrowRight03Icon, ArrowDown01Icon, ArrowUpRight01Icon, CircleIcon, LockIcon, Coins01Icon } from "hugeicons-react";
import { formatEther } from "viem";
import { TransferModal } from "./TransferModal";

const sidebarAnimation = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { type: "spring" as const, damping: 20, stiffness: 300 }
};

const formatCurrency = (amount: number, currency: string = "USD", locale: string = "en-US") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const shortenAddress = (address: string, chars: number = 4) => {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const WalletDetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'balances' | 'transactions'>('balances');
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { currentNetwork } = useNetwork();
  const { price, isLoading: isPriceLoading } = useTokenPrice();
  const { balance, isLoading } = useWalletBalance();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleCopyAddress = () => {
    const address = user?.linkedAccounts.find(account => account.type === "wallet")?.address;
    if (address) {
      navigator.clipboard.writeText(address);
      setIsAddressCopied(true);
      setTimeout(() => setIsAddressCopied(false), 2000);
    }
  };

  const getNetworkLogoPath = () => {
    if (!currentNetwork?.name) return "/assets/logo/eth-logo.svg";
    
    const networkName = currentNetwork.name.toLowerCase();
    switch (networkName) {
      case "base":
        return "/assets/logo/base-logo.svg";
      case "optimism":
        return "/assets/logo/op-logo.svg";
      case "ethereum":
      default:
        return "/assets/logo/eth-logo.svg";
    }
  };

  const getUsdValue = (ethAmount: string) => {
    const ethValue = parseFloat(ethAmount);
    return formatCurrency(ethValue * price);
  };

  return (
    <>
      {/* Wallet balance button in header */}
      <button
        type="button"
        title="Wallet balance"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 px-2.5 py-2.5 transition-colors duration-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <Wallet01Icon className="size-5 text-gray-900" />
        <div className="h-9 w-px border-r border-dashed border-gray-200" />
        <div className="flex items-center gap-1.5">
          <p className={`text-gray-900 font-semibold transition-all duration-200 ${
            isLoading || isPriceLoading ? 'blur-sm opacity-50' : 'blur-0 opacity-100'
          }`}>
            {getUsdValue(balance)}
          </p>
          <ArrowDown01Icon
            aria-label="Caret down"
            className={`mx-1 size-4 text-gray-500 transition-transform duration-300 ${
              isSidebarOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Sidebar dialog for wallet details */}
      <AnimatePresence>
        {isSidebarOpen && (
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-hidden"
            onClose={handleSidebarClose}
            open={isSidebarOpen}
          >
            <div className="flex h-full">
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={handleSidebarClose}
              />

              {/* Sidebar content */}
              <motion.div
                initial={sidebarAnimation.initial}
                animate={sidebarAnimation.animate}
                exit={sidebarAnimation.exit}
                transition={sidebarAnimation.transition}
                className="z-50 my-4 ml-auto mr-4 flex h-[calc(100%-32px)] w-full max-w-[396px] flex-col overflow-hidden rounded-[20px] border border-gray-200 bg-white shadow-lg"
              >
                <div className="flex h-full flex-col p-5">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Wallet
                    </h2>
                    <button
                      type="button"
                      title="Close wallet details"
                      onClick={handleSidebarClose}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                      <ArrowRight03Icon className="size-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Wallet info card */}
                  <div className="mt-6 space-y-6 rounded-[20px] border border-gray-200 bg-transparent p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Wallet01Icon className="size-4 text-gray-500" />
                        <p className="text-gray-900">
                          {shortenAddress(user?.linkedAccounts.find(account => account.type === "wallet")?.address ?? "")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        title="Copy wallet address"
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                      >
                        {isAddressCopied ? (
                          <PiCheck className="size-4 text-green-500" />
                        ) : (
                          <Copy01Icon className="size-4 text-gray-500" />
                        )}
                      </button>
                    </div>

                    <div className={`text-2xl font-medium text-gray-900 transition-all duration-200 ${
                      isLoading || isPriceLoading ? 'blur-sm opacity-50' : 'blur-0 opacity-100'
                    }`}>
                      {getUsdValue(balance)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsTransferModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <ArrowUpRight01Icon className="size-5" />
                        <span>Transfer</span>
                      </button>
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        <CircleIcon className="size-5" />
                        <span>Fund</span>
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="mt-6">
                    <div className="flex border-b border-gray-200">
                      <button
                        type="button"
                        onClick={() => setActiveTab('balances')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors duration-200 ${
                          activeTab === 'balances'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span>Balances</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('transactions')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors duration-200 ${
                          activeTab === 'transactions'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span>Transactions</span>
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-4">
                      {activeTab === 'balances' ? (
                        <div className="space-y-4">
                          {/* ETH Balance Card */}
                          <div className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Image
                                    src="/assets/logo/eth-logo.svg"
                                    alt="ETH"
                                    width={32}
                                    height={32}
                                    className="size-8 rounded-full"
                                  />
                                  <Image
                                    src={getNetworkLogoPath()}
                                    alt={currentNetwork?.name || "Network"}
                                    width={16}
                                    height={16}
                                    className="absolute -bottom-1 -right-1 size-4 rounded-full"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-900">ETH</span>
                                  <span className={`text-gray-500 transition-all duration-200 ${
                                    isLoading ? 'blur-sm opacity-50' : 'blur-0 opacity-100'
                                  }`}>
                                    {`${parseFloat(balance).toFixed(4)} ETH`}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`text-gray-900 transition-all duration-200 ${
                                  isLoading || isPriceLoading ? 'blur-sm opacity-50' : 'blur-0 opacity-100'
                                }`}>
                                  {getUsdValue(balance)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-gray-500 text-sm">No transactions found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        balance={balance}
      />
    </>
  );
}; 