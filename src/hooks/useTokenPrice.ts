import { useState, useEffect } from 'react';

export const useTokenPrice = () => {
  const [price, setPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch price');
        }

        const data = await response.json();
        setPrice(data.ethereum.usd);
        setError(null);
      } catch (err) {
        console.error('Error fetching ETH price:', err);
        setError('Failed to fetch price');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    // Refresh price every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { price, isLoading, error };
}; 