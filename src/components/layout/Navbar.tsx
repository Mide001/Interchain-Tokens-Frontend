"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useTruncateAddress } from "@/hooks/useTruncateAddress";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { WalletDetails } from "@/components/WalletDetails";
import { SettingsDropdown } from "@/components/SettingsDropdown";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { authenticated, login } = usePrivy();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo - visible on mobile */}
          <div className="flex items-center lg:hidden">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-plus-jakarta">
              BuildFlex
            </h1>
          </div>

          {/* Empty div for desktop spacing */}
          <div className="hidden lg:flex lg:items-center">
            {/* Empty div to maintain spacing */}
          </div>

          {/* Right side - Desktop menu */}
          <div className="hidden lg:flex lg:items-center space-x-6">
            {/* Wallet Details */}
            {authenticated && <WalletDetails />}

            {/* Network Switcher */}
            {authenticated && <NetworkSwitcher />}

            {/* Settings Dropdown */}
            {authenticated ? (
              <SettingsDropdown />
            ) : (
              <button
                onClick={login}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 font-inter"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="pt-2 pb-3 space-y-1">
          <div className="px-4 py-3 space-y-3">
            {/* Network Switcher for mobile */}
            {authenticated && (
              <div className="px-4">
                <NetworkSwitcher />
              </div>
            )}

            {/* Wallet Details for mobile */}
            {authenticated && (
              <div className="px-4">
                <WalletDetails />
              </div>
            )}

            {authenticated ? (
              <div className="px-4">
                <SettingsDropdown />
              </div>
            ) : (
              <button
                onClick={login}
                className="w-full flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg font-inter"
              >
                <svg
                  className="mr-3 h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
