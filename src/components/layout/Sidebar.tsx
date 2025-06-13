"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface UserProfile {
  email: string;
  name: string;
  initial: string;
}

interface SidebarProps {
  userProfile?: UserProfile;
}

const navigation: NavItem[] = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Launch a Token", href: "/launch", icon: "🚀" },
  { name: "My Tokens", href: "/my-tokens", icon: "💎" },
  { name: "How it Works", href: "/how-it-works", icon: "❓" },
  { name: "Docs", href: "/docs", icon: "📚" },
];

export default function Sidebar({ userProfile }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-1/2 -translate-y-1/2 left-4 z-30 p-2 rounded-md bg-white shadow-md hover:bg-gray-50 transition-colors duration-200 text-gray-600 hover:text-gray-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-8 pt-12">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-plus-jakarta">
              BuildFlex
            </h1>
          </div>

          <div className="flex-1 flex flex-col pt-20 pb-4 overflow-y-auto">
            <nav className="flex-1 px-6 space-y-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="mr-4 text-lg">{item.icon}</span>
                    <span className="text-base font-inter">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-6 border-t border-gray-200">
            {userProfile ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                  {userProfile.initial}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 font-inter">
                    {userProfile.name}
                  </p>
                  <p className="text-xs text-gray-500 font-inter">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                  G
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 font-inter">
                    Guest
                  </p>
                  <p className="text-xs text-gray-500 font-inter">
                    Not signed in
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
