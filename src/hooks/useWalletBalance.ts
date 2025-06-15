import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { formatEther } from "viem";

export const useWalletBalance = () => {
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!embeddedWallet || !user?.linkedAccounts) return;

      try {
        setIsLoading(true);
        const provider = await embeddedWallet.getEthereumProvider();
        const address = user.linkedAccounts.find(account => account.type === "wallet")?.address;
        
        if (!address) return;

        const balance = await provider.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });

        setBalance(formatEther(BigInt(balance as string)));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance("0");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
    // Set up an interval to refresh the balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, [embeddedWallet, user?.linkedAccounts]);

  return { balance, isLoading };
}; 