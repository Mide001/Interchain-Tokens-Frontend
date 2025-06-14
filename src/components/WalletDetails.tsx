"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion, Transition } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useNetwork } from "@/hooks/useNetwork";
import Image from "next/image";
import { PiCheck } from "react-icons/pi";
import { Copy01Icon, Wallet01Icon, ArrowRight03Icon, ArrowDown01Icon } from "hugeicons-react";

const sidebarAnimation = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { type: "spring" as const, damping: 20, stiffness: 300 }
};

const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
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
  const { user } = usePrivy();
  const { currentNetwork } = useNetwork();

  // Mock balance - replace with actual balance fetching logic
  const balance = 1234.56;

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
    return `/assets/logo/${currentNetwork.name.toLowerCase().replace(" ", "-")}-logo.svg`;
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
          <p className="text-gray-900 font-semibold">{formatCurrency(balance)}</p>
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

                    <div className="text-2xl font-medium text-gray-900">
                      {formatCurrency(balance)}
                    </div>

                    {/* Balance details */}
                    <div className="flex items-center justify-between text-sm">
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
                          <span className="text-gray-500">0.5 ETH</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-gray-900">
                          {formatCurrency(balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}; 