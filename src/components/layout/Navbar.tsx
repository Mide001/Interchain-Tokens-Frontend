"use client";

import { useState, useRef, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function Navbar() {
  const { authenticated, login, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const [showDropdown, setShowDropdown] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get wallet address when authenticated
  useEffect(() => {
    if (authenticated && ready && wallets.length > 0) {
      const embeddedWallet = wallets[0];
      setWalletAddress(embeddedWallet.address);
    }
  }, [authenticated, ready, wallets]);

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      // You could add a toast notification here
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = () => {
    // You can customize this based on the network
    return `https://sepolia.etherscan.io/address/${walletAddress}`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-plus-jakarta lg:hidden ml-14">
              BuildFlex
            </h1>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-plus-jakarta hidden lg:block">
              BuildFlex
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <button className="p-2 md:p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            
            {/* Wallet/Login Button */}
            {authenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center px-3 py-2 bg-transparent font-bold text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  
                  <span className="text-sm font-medium">
                    {walletAddress ? formatAddress(walletAddress) : "Connected"}
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-blue-700 rounded-lg shadow-lg py-2 text-white">
                    <div className="px-4 py-2 flex items-center justify-between border-b border-gray-800">
                      <span className="text-sm text-white font-bold">
                        {walletAddress ? formatAddress(walletAddress) : ""}
                      </span>
                      <button
                        onClick={handleCopyAddress}
                        className="p-1 text-white hover:bg-gray-800 rounded transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    <a
                      href={getExplorerUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm text-white font-bold hover:bg-gray-800 flex items-center transition-colors duration-200"
                    >
                      View on explorer
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>

                    <div className="px-4 py-2 border-t font-bold border-gray-800">
                      <button
                        onClick={logout}
                        className="w-full text-left text-sm text-red-500 font-bold hover:text-red-400 transition-colors duration-200"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={login}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 font-inter focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
