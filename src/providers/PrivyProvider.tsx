"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmbs4506m017ijo0nmnw7hx9j"
      clientId="client-WY6MCeXPXMRFwngxKiaUbb1HwY5eu7kTsNz2DYcSvkmZL"
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
