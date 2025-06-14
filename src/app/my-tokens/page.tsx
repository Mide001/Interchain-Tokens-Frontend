"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import NetworkDropdown from "@/components/ui/NetworkDropdown";
import Image from "next/image";

interface Token {
    id: string;
    name: string;
    symbol: string;
    balance: string;
    value: number;
    change24h: number;
    network: string;
    logoUrl?: string;
    marketCap?: number;
    volume24h?: number;
}

// Dummy data for demonstration
const dummyTokens: Token[] = [
    {
        id: "1",
        name: "Ethereum",
        symbol: "ETH",
        balance: "2.5",
        value: 4521.25,
        change24h: 2.5,
        network: "Ethereum",
        marketCap: 234567890,
        volume24h: 12345678,
    },
    {
        id: "2",
        name: "BuildFlex Token",
        symbol: "BFT",
        balance: "1000",
        value: 1500.00,
        change24h: -1.2,
        network: "Optimism",
        marketCap: 1234567,
        volume24h: 234567,
    },
    {
        id: "3",
        name: "USD Coin",
        symbol: "USDC",
        balance: "500",
        value: 500.00,
        change24h: 0.01,
        network: "Ethereum",
        marketCap: 34567890,
        volume24h: 2345678,
    },
];

const statsCards = [
    {
        title: "Total Balance",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: "24h Change",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
    },
    {
        title: "Total Tokens",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
];

const networks = [
    { 
        id: "all", 
        name: "All Networks",
        logo: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
        )
    },
    { 
        id: "sepolia", 
        name: "Ethereum Sepolia",
        logo: (
            <Image src="/assets/logo/eth.svg" alt="Ethereum Sepolia" width={20} height={20} />
        )
    },
    { 
        id: "base-sepolia", 
        name: "Base Sepolia",
        logo: (
            <Image src="/assets/logo/base-logo.svg" alt="Base Sepolia" width={20} height={20} />
        )
    },
    { 
        id: "optimism-sepolia", 
        name: "Optimism Sepolia",
        logo: (
            <Image src="/assets/logo/op-logo.svg" alt="Optimism Sepolia" width={20} height={20} />
        )
    },
];

export default function MyTokens() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNetwork, setSelectedNetwork] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: "value", direction: "desc" });

    const filteredTokens = dummyTokens.filter(token => {
        const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesNetwork = selectedNetwork === "all" || token.network === selectedNetwork;
        return matchesSearch && matchesNetwork;
    }).sort((a, b) => {
        if (sortConfig.key === "value") {
            return sortConfig.direction === "asc" ? a.value - b.value : b.value - a.value;
        }
        if (sortConfig.key === "change24h") {
            return sortConfig.direction === "asc" ? a.change24h - b.change24h : b.change24h - a.change24h;
        }
        return 0;
    });

    const totalValue = filteredTokens.reduce((acc, token) => acc + token.value, 0);
    const totalChange24h = filteredTokens.reduce((acc, token) => acc + (token.value * (token.change24h / 100)), 0);
    const change24hPercentage = (totalChange24h / totalValue) * 100;

    const handleSort = (key: "value" | "change24h") => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc"
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Tokens</h1>
                    <p className="mt-2 text-gray-600">Manage your token portfolio across different networks</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-xl shadow-sm p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                {statsCards[0].icon}
                                <h3 className="ml-2 text-sm font-medium text-gray-500">{statsCards[0].title}</h3>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white rounded-xl shadow-sm p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                {statsCards[1].icon}
                                <h3 className="ml-2 text-sm font-medium text-gray-500">{statsCards[1].title}</h3>
                            </div>
                        </div>
                        <p className={`text-2xl font-bold ${change24hPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change24hPercentage > 0 ? '+' : ''}{change24hPercentage.toFixed(2)}%
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-xl shadow-sm p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                {statsCards[2].icon}
                                <h3 className="ml-2 text-sm font-medium text-gray-500">{statsCards[2].title}</h3>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{filteredTokens.length}</p>
                    </motion.div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search tokens..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg
                            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="w-48">
                        <NetworkDropdown
                            selectedNetwork={selectedNetwork}
                            onNetworkChange={setSelectedNetwork}
                            networks={networks}
                        />
                    </div>
                    
                    {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap">
                        Add Token
                    </button> */}
                </div>

                {/* Tokens List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-blue-700 text-sm font-bold text-white">
                        <div className="col-span-4">Token</div>
                        <div className="col-span-2 text-right">Balance</div>
                        <button
                            onClick={() => handleSort("value")}
                            className={`col-span-2 text-right flex items-center justify-end ${sortConfig.key === "value" ? "text-blue-600" : ""}`}
                        >
                            Value
                            <svg className={`w-4 h-4 ml-1 transform ${sortConfig.key === "value" && sortConfig.direction === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleSort("change24h")}
                            className={`col-span-2 text-right flex items-center justify-end ${sortConfig.key === "change24h" ? "text-white" : ""}`}
                        >
                            24h Change
                            <svg className={`w-4 h-4 ml-1 transform ${sortConfig.key === "change24h" && sortConfig.direction === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {filteredTokens.map((token) => (
                        <motion.div
                            key={token.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors duration-200"
                        >
                            <div className="col-span-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-white font-semibold">{token.symbol[0]}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{token.name}</div>
                                        <div className="text-sm text-gray-500 flex items-center">
                                            {token.symbol}
                                            <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                                {token.network}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 text-right">
                                <div className="font-medium text-gray-900">{token.balance}</div>
                                <div className="text-sm text-gray-500">{token.symbol}</div>
                            </div>
                            <div className="col-span-2 text-right">
                                <div className="font-medium text-gray-900">${token.value.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">USD</div>
                            </div>
                            <div className={`col-span-2 text-right font-medium ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <div className="flex items-center justify-end">
                                    <svg
                                        className={`w-4 h-4 mr-1 ${token.change24h >= 0 ? 'transform rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                    {token.change24h > 0 ? '+' : ''}{token.change24h}%
                                </div>
                            </div>
                            <div className="col-span-2 text-right space-x-2">
                                <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                                    Send
                                </button>
                                
                            </div>
                        </motion.div>
                    ))}

                    {filteredTokens.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-medium">No tokens found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 