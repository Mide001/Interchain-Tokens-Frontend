import { useState, useEffect } from 'react';
import { Alchemy, Network, AssetTransfersCategory } from 'alchemy-sdk';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNum: string;
  category: string;
  timestamp?: number;
  date?: string;
}

export interface TransactionHistory {
  incoming: Transaction[];
  outgoing: Transaction[];
}

const getAlchemySettings = (networkName: string) => {
  switch (networkName.toLowerCase()) {
    case 'sepolia':
      return {
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "FGqEuPDz4K6szmtHsdE_Px8E5cDL5L6W",
        network: Network.ETH_SEPOLIA,
      };
    case 'base sepolia':
      return {
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "FGqEuPDz4K6szmtHsdE_Px8E5cDL5L6W",
        network: Network.BASE_SEPOLIA,
      };
    case 'optimism sepolia':
      return {
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "FGqEuPDz4K6szmtHsdE_Px8E5cDL5L6W",
        network: Network.OPT_SEPOLIA,
      };
    default:
      return {
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "FGqEuPDz4K6szmtHsdE_Px8E5cDL5L6W",
        network: Network.ETH_SEPOLIA,
      };
  }
};

export const useTransactions = (address: string, networkName: string) => {
  const [transactions, setTransactions] = useState<TransactionHistory>({ incoming: [], outgoing: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address || !networkName) return;

      setIsLoading(true);
      setError(null);

      try {
        const settings = getAlchemySettings(networkName);
        console.log('Alchemy settings:', settings);
        const alchemy = new Alchemy(settings);

        console.log('Fetching transactions for:', address, 'on network:', networkName);

        // Test Alchemy connection
        try {
          const latestBlock = await alchemy.core.getBlockNumber();
          console.log('Latest block number:', latestBlock);
        } catch (err) {
          console.error('Error testing Alchemy connection:', err);
        }

        // Get incoming transactions
        const incomingTxs = await alchemy.core.getAssetTransfers({
          fromBlock: "0x0",
          toAddress: address,
          category: [AssetTransfersCategory.EXTERNAL],
          maxCount: 10
        });

        // Get outgoing transactions
        const outgoingTxs = await alchemy.core.getAssetTransfers({
          fromBlock: "0x0",
          fromAddress: address,
          category: [AssetTransfersCategory.EXTERNAL],
          maxCount: 10
        });

        console.log('Raw incoming transactions:', incomingTxs.transfers);
        console.log('Raw outgoing transactions:', outgoingTxs.transfers);

        // Transform and filter transactions with timestamps
        const transformTransaction = async (tx: any): Promise<Transaction> => {
          console.log('Processing transaction:', tx);
          
          // Use existing timestamp if available, otherwise try to get from block
          let timestamp = tx.timestamp;
          
          // If no timestamp in transaction data, try to get from block
          if (!timestamp && tx.blockNum) {
            try {
              console.log('Fetching block timestamp for block:', tx.blockNum);
              const block = await alchemy.core.getBlock(parseInt(tx.blockNum));
              timestamp = block.timestamp;
              console.log('Got timestamp from block:', timestamp);
            } catch (err) {
              console.error('Error fetching block timestamp for block', tx.blockNum, ':', err);
              // Use a mock timestamp based on block number
              timestamp = Math.floor(Date.now() / 1000) - (parseInt(tx.blockNum) * 12);
              console.log('Using mock timestamp:', timestamp);
            }
          }
          
          // Final fallback to current time
          if (!timestamp) {
            timestamp = Math.floor(Date.now() / 1000);
            console.log('Using current time as final fallback:', timestamp);
          }
          
          const date = timestamp ? new Date(timestamp * 1000).toLocaleDateString() : undefined;
          
          const transformed = {
            hash: tx.hash,
            from: tx.from || '',
            to: tx.to || '',
            value: tx.value || '0',
            blockNum: tx.blockNum || '0',
            category: tx.category || 'external',
            timestamp,
            date
          };
          
          console.log('Transformed transaction:', transformed);
          return transformed;
        };

        // Process all transactions with timestamps
        const processTransactions = async (txs: any[]) => {
          const processed = await Promise.all(txs.map(transformTransaction));
          return processed;
        };

        const [processedIncoming, processedOutgoing] = await Promise.all([
          processTransactions(incomingTxs.transfers),
          processTransactions(outgoingTxs.transfers)
        ]);

        console.log('Final processed transactions:', { incoming: processedIncoming, outgoing: processedOutgoing });

        setTransactions({
          incoming: processedIncoming,
          outgoing: processedOutgoing
        });

      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to fetch transaction history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, networkName]);

  return {
    transactions,
    isLoading,
    error,
    refetch: () => {
      // Trigger refetch by updating dependencies
      setTransactions({ incoming: [], outgoing: [] });
    }
  };
}; 