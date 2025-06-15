"use client";

import { usePrivy } from "@privy-io/react-auth";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, user } = usePrivy();

  // Get user's email address as string
  const userEmail = user?.email?.address || "";
  const userInitial = userEmail.charAt(0).toUpperCase() || "U";
  const userName = userEmail.split("@")[0] || "User";

  const userProfile = authenticated
    ? {
        email: userEmail,
        name: userName,
        initial: userInitial,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1">
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
