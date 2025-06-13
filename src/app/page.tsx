"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const networks = ["Base", "Ethereum", "Optimism"];

function NetworkAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % networks.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block">
      <span className="inline-block animate-fade-in-out">
        {networks[currentIndex]}
      </span>
    </span>
  );
}

const tokens = [
  {
    name: "DogeCoin",
    symbol: "DOGE",
    totalSupply: "132.67B",
    description:
      "The original meme coin that started it all. From a joke to a cultural phenomenon, DOGE has become a symbol of the crypto community's playful spirit.",
    image:
      "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x4f1aac70b303818ddd0823570af3bb46681d9bd8.png?size=lg&key=ac2054",
  },
  {
    name: "Pepe",
    symbol: "PEPE",
    totalSupply: "420.69T",
    description:
      "The frog-themed meme token that took the crypto world by storm. Built on the legacy of the iconic Pepe meme, creating a vibrant community of enthusiasts.",
    image:
      "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x4f1aac70b303818ddd0823570af3bb46681d9bd8.png?size=lg&key=ac2054",
  },
  {
    name: "Shiba Inu",
    symbol: "SHIB",
    totalSupply: "549.06T",
    description:
      "The self-proclaimed 'DOGE killer' that has carved its own path. With a massive community and ambitious ecosystem, SHIB has become more than just a meme.",
    image:
      "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x4f1aac70b303818ddd0823570af3bb46681d9bd8.png?size=lg&key=ac2054",
  },
  {
    name: "Floki",
    symbol: "FLOKI",
    totalSupply: "9.7T",
    description:
      "Named after Elon Musk's dog, this Viking-themed token has built a strong community around education and gaming, combining memes with utility.",
    image:
      "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x4f1aac70b303818ddd0823570af3bb46681d9bd8.png?size=lg&key=ac2054",
  },
  {
    name: "Bonk",
    symbol: "BONK",
    totalSupply: "93.5T",
    description:
      "Solana's first dog coin that brought fun and excitement to the ecosystem. With its playful branding, BONK has become a symbol of Solana's meme scene.",
    image:
      "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x4f1aac70b303818ddd0823570af3bb46681d9bd8.png?size=lg&key=ac2054",
  },
  {
    name: "Wojak",
    symbol: "WOJAK",
    totalSupply: "1T",
    description:
      "The feel-good meme token based on the popular Wojak character. Known for its community-driven approach and emphasis on mental health awareness.",
    image:
      "https://dd.dexscreener.com/ds-data/tokens/ethereum/0x4f1aac70b303818ddd0823570af3bb46681d9bd8.png?size=lg&key=ac2054",
  },
];

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <section className="py-24 rounded-lg">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#1d4ed8] rounded-lg"
          style={{
            backgroundImage: `linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="py-12">
              <div className="space-y-16">
                <h1 className="text-4xl md:text-5xl font-medium font-plus-jakarta">
                  Launch a token on the <NetworkAnimation /> chain
                </h1>
                <div className="flex flex-row gap-4">
                  <button className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-blue-100 transition-colors duration-200 font-inter">
                    Create a Token
                  </button>
                  <button className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-[#2563eb] transition-colors duration-200 font-inter">
                    Explore Tokens
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="flex justify-center">
              <img
                src="/hero-image.png"
                alt="Token Launch Illustration"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Token Showcase Section */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-lg">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold font-plus-jakarta text-gray-900">
                Top Tokens
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tokens..."
                  className="pl-10 pr-4 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
                <svg
                  className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Token Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tokens.map((token, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-3xl p-6 transition-shadow duration-200"
                >
                  <div className="bg-white rounded-xl p-4 mb-3">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={token.image}
                        alt={`${token.name} logo`}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold font-plus-jakarta text-gray-900">
                            {token.name}
                          </h3>
                          <p className="text-base text-gray-700 font-inter">
                            {token.symbol}
                          </p>
                          <span className="text-sm font-medium text-gray-700 font-plus-jakarta">
                            {token.totalSupply}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 font-inter text-base">
                    {token.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
