"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import MainLayout from "@/components/layout/MainLayout";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <MainLayout>{children}</MainLayout>
    </PrivyProvider>
  );
} 