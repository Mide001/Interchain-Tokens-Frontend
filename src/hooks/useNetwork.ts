import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePrivy, useWallets } from '@privy-io/react-auth';

export type Network = {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  chainId: string;
};

export const SUPPORTED_NETWORKS: Network[] = [
  {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    chainId: '0xaa36a7',
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    chainId: '0x14a34',
  },
  {
    id: 11155420,
    name: 'Optimism Sepolia',
    rpcUrl: 'https://sepolia.optimism.io',
    blockExplorer: 'https://sepolia-optimism.etherscan.io',
    chainId: '0xaa37dc',
  },
];

export const useNetwork = () => {
  const [currentNetwork, setCurrentNetwork] = useState<Network | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { ready } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  const getChainId = async () => {
    if (!embeddedWallet) return null;
    
    try {
      const provider = await embeddedWallet.getEthereumProvider();
      const chainId = await provider.request({ method: 'eth_chainId' });
      return chainId;
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return null;
    }
  };

  const switchNetwork = async (network: Network) => {
    if (!embeddedWallet) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    try {
      const provider = await embeddedWallet.getEthereumProvider();
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
      
      setCurrentNetwork(network);
      toast.success(`Switched to ${network.name}`);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const provider = await embeddedWallet.getEthereumProvider();
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.chainId,
              chainName: network.name,
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorer]
            }],
          });
          setCurrentNetwork(network);
          toast.success(`Added and switched to ${network.name}`);
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add network');
        }
      } else {
        console.error('Error switching network:', switchError);
        toast.error('Failed to switch network');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initNetwork = async () => {
      if (!embeddedWallet || !ready) return;
      
      try {
        const chainId = await getChainId();
        if (chainId && mounted) {
          const network = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
          if (network) {
            setCurrentNetwork(network);
          }
        }
      } catch (error) {
        console.error('Error initializing network:', error);
      }
    };

    if (embeddedWallet && ready) {
      initNetwork();

      // Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        if (!mounted) return;
        const network = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
        if (network) {
          setCurrentNetwork(network);
        }
      };

      const setupChainChangeListener = async () => {
        const provider = await embeddedWallet.getEthereumProvider();
        provider.on('chainChanged', handleChainChanged as any);
        return () => {
          mounted = false;
          provider.removeListener('chainChanged', handleChainChanged as any);
        };
      };

      setupChainChangeListener();
    }
  }, [embeddedWallet, ready]);

  return {
    currentNetwork,
    switchNetwork,
    isLoading,
    supportedNetworks: SUPPORTED_NETWORKS,
  };
}; 