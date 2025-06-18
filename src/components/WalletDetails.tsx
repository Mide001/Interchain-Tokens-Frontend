"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useNetwork } from "@/hooks/useNetwork";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useTransactions } from "@/hooks/useTransactions";
import { formatTransactionValue, shortenHash, getBlockExplorerUrl, formatTransactionDate, formatTransactionTime } from "@/utils/format";
import Image from "next/image";
import { PiCheck } from "react-icons/pi";
import { Copy01Icon, Wallet01Icon, ArrowRight03Icon, ArrowDown01Icon, ArrowUpRight01Icon, CircleIcon, ArrowUpRight02Icon, ArrowDownRight02Icon } from "hugeicons-react";
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
  const { currentNetwork } = useNetwork();
  const { price, isLoading: isPriceLoading } = useTokenPrice();
  const { balance, isLoading } = useWalletBalance();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const walletAddress = user?.linkedAccounts.find(account => account.type === "wallet")?.address;
  const { transactions, isLoading: isTransactionsLoading, error: transactionsError } = useTransactions(
    walletAddress || '',
    currentNetwork?.name || ''
  );

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

  const getTransactionIcon = (type: 'incoming' | 'outgoing') => {
    return type === 'incoming' ? (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
      </svg>
    );
  };

  const handleTransactionClick = (hash: string) => {
    const url = getBlockExplorerUrl(currentNetwork?.name || '', hash);
    window.open(url, '_blank');
  };

  const renderTransactions = () => {
    if (isTransactionsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-sm text-gray-500">Loading transactions...</p>
          </div>
        </div>
      );
    }

    if (transactionsError) {
      return (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Failed to load transactions</p>
              <p className="text-xs text-gray-500 mt-1">Please try again later</p>
            </div>
          </div>
        </div>
      );
    }

    const allTransactions = [
      ...transactions.incoming.map(tx => ({ ...tx, type: 'incoming' as const })),
      ...transactions.outgoing.map(tx => ({ ...tx, type: 'outgoing' as const }))
    ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (allTransactions.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">No transactions found</p>
              <p className="text-xs text-gray-500 mt-1">Your transaction history will appear here</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Recent Transactions</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {allTransactions.length} total
          </span>
        </div>
        
        {allTransactions.slice(0, 10).map((tx, index) => (
          <button
            key={`${tx.hash}-${index}`}
            onClick={() => handleTransactionClick(tx.hash)}
            className="w-full group relative animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              {/* Transaction Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                tx.type === 'incoming' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {getTransactionIcon(tx.type)}
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        tx.type === 'incoming' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {tx.type === 'incoming' ? 'Received' : 'Sent'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-500">
                        {formatTransactionDate(tx.timestamp)}
                      </span>
                      {tx.timestamp && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {formatTransactionTime(tx.timestamp)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${
                      tx.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'incoming' ? '+' : '-'}{formatTransactionValue(tx.value)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}

        {allTransactions.length > 10 && (
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              Showing 10 of {allTransactions.length} transactions
            </p>
          </div>
        )}
      </div>
    );
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
                          <div className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors duration-200 group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Image
                                      src="/assets/logo/eth-logo.svg"
                                      alt="ETH"
                                      width={24}
                                      height={24}
                                      className="size-6"
                                    />
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center">
                                    <Image
                                      src={getNetworkLogoPath()}
                                      alt={currentNetwork?.name || "Network"}
                                      width={12}
                                      height={12}
                                      className="size-3"
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-gray-900">Ethereum</span>
                                  <span className={`text-xs text-gray-500 transition-all duration-200 ${
                                    isLoading ? 'blur-sm opacity-50' : 'blur-0 opacity-100'
                                  }`}>
                                    {`${parseFloat(balance).toFixed(4)} ETH`}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col items-end">
                                  <span className={`text-sm font-bold text-gray-900 transition-all duration-200 ${
                                    isLoading || isPriceLoading ? 'blur-sm opacity-50' : 'blur-0 opacity-100'
                                  }`}>
                                    {getUsdValue(balance)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {currentNetwork?.name || "Ethereum"}
                                  </span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Coming Soon Section */}
                          <div className="rounded-xl border border-gray-200 p-6 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">More tokens coming soon</p>
                                <p className="text-xs text-gray-500 mt-1">Support for ERC-20 tokens and NFTs</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {renderTransactions()}
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