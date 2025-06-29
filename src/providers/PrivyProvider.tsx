"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { sepolia, baseSepolia, optimismSepolia} from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || ''}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: sepolia,
        supportedChains: [sepolia, baseSepolia, optimismSepolia]
      }}
    >
      {children}
    </PrivyProvider>
  );
}
