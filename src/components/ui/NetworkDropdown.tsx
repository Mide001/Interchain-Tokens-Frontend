"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Network {
  id: string;
  name: string;
  logo: ReactNode;
}

const DEFAULT_NETWORK: Network = {
  id: "none",
  name: "Select Network",
  logo: (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )
};

interface NetworkDropdownProps {
  selectedNetwork: string;
  onNetworkChange: (networkId: string) => void;
  networks?: Network[];
}

export default function NetworkDropdown({ 
  selectedNetwork, 
  onNetworkChange, 
  networks = [] 
}: NetworkDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedNetworkData = networks.find(n => n.id === selectedNetwork) || networks[0] || DEFAULT_NETWORK;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {selectedNetworkData.logo}
          </div>
          <span className="ml-3 font-medium truncate">{selectedNetworkData.name}</span>
        </div>
        <svg
          className={`w-5 h-5 ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 overflow-hidden"
          >
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  onNetworkChange(network.id);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-left transition-colors duration-200
                  ${selectedNetwork === network.id 
                    ? 'bg-blue-50/80 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {network.logo}
                </div>
                <span className="ml-3 font-medium">{network.name}</span>
                {selectedNetwork === network.id && (
                  <svg
                    className="w-5 h-5 ml-auto text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 