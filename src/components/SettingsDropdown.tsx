"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useTruncateAddress } from "@/hooks/useTruncateAddress";
import { Setting07Icon, Wallet01Icon, Mail01Icon, CustomerService01Icon, Logout03Icon, Copy01Icon } from "hugeicons-react";
import { AnimatePresence, motion } from "framer-motion";
import { PiCheck } from "react-icons/pi";

const dropdownVariants = {
  closed: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const SettingsDropdown = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const { logout, user } = usePrivy();
  const { truncateAddress } = useTruncateAddress();

  const handleCopyAddress = () => {
    const address = user?.linkedAccounts.find(account => account.type === "wallet")?.address;
    if (address) {
      navigator.clipboard.writeText(address);
      setIsAddressCopied(true);
      setTimeout(() => setIsAddressCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        className="flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 p-2 transition-colors duration-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <Setting07Icon
          className={`size-5 text-gray-900 transition-transform duration-300 ${
            isSettingsOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={dropdownVariants}
            className="absolute right-0 z-10 mt-4 w-80 space-y-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
          >
            <ul className="text-sm font-normal text-gray-900">
              <li className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-4 py-2 transition-all duration-300 hover:bg-gray-100">
                <button
                  type="button"
                  className="group flex w-full items-center justify-between gap-4"
                  onClick={handleCopyAddress}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet01Icon className="size-5 text-gray-500" />
                    <p className="max-w-60 break-words">
                      {truncateAddress(user?.linkedAccounts.find(account => account.type === "wallet")?.address || "")}
                    </p>
                  </div>
                  {isAddressCopied ? (
                    <PiCheck className="size-4 text-green-500" />
                  ) : (
                    <Copy01Icon className="size-4 text-gray-500" />
                  )}
                </button>
              </li>

              <li className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-4 py-2 transition-all duration-300 hover:bg-gray-100">
                <div className="flex items-center gap-2.5">
                  <Mail01Icon className="size-5 text-gray-500" />
                  <p>Email</p>
                </div>
                <p className="text-gray-500">
                  {user?.email?.address || "Not linked"}
                </p>
              </li>

              <li className="flex cursor-pointer items-center gap-2.5 rounded-lg px-4 py-2 transition-all duration-300 hover:bg-gray-100">
                <a
                  href="https://support.buildflex.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5"
                >
                  <CustomerService01Icon className="size-5 text-gray-500" />
                  <p>Contact support</p>
                </a>
              </li>

              <li className="flex cursor-pointer items-center gap-2.5 rounded-lg px-4 py-2 transition-all duration-300 hover:bg-gray-100">
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-2.5"
                >
                  <Logout03Icon className="size-5 text-gray-500" />
                  <p>Sign out</p>
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 