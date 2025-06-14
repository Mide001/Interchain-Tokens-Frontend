"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiPlusCircle, HiCurrencyDollar, HiQuestionMarkCircle, HiBookOpen } from "react-icons/hi2";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
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
  { name: "Home", href: "/", icon: <HiHome className="w-5 h-5" /> },
  { name: "Launch a Token", href: "/launch", icon: <HiPlusCircle className="w-5 h-5" /> },
  { name: "My Tokens", href: "/my-tokens", icon: <HiCurrencyDollar className="w-5 h-5" /> },
  { name: "How it Works", href: "/how-it-works", icon: <HiQuestionMarkCircle className="w-5 h-5" /> },
  { name: "Docs", href: "/docs", icon: <HiBookOpen className="w-5 h-5" /> },
];

export default function Sidebar({ userProfile }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close sidebar on escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-0 left-4 z-[60] p-2.5 mt-[0.875rem] rounded-lg bg-white shadow-md hover:bg-gray-50 transition-all duration-200 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="sidebar"
        aria-label="Toggle navigation"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm transition-opacity lg:hidden z-[45]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-[50] w-[280px] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-lg" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-6 pt-8 lg:pt-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-plus-jakarta">
              BuildFlex
            </h1>
          </div>

          <div className="flex-1 flex flex-col pt-12 pb-4 overflow-y-auto">
            <nav className="flex-1 px-6 space-y-4">
              {navigation.map((item) => {
                const isActive = item.href === '/launch' 
                  ? pathname === item.href || pathname.startsWith('/token/')
                  : pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-white text-blue-600 border-2 border-blue-500 scale-105 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-4">{item.icon}</span>
                    <span className={`text-base font-inter ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            {userProfile ? (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
                  {userProfile.initial}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 font-inter line-clamp-1">
                    {userProfile.name}
                  </p>
                  <p className="text-xs text-gray-500 font-inter line-clamp-1">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
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
      </aside>
    </>
  );
}
