export const formatEthValue = (value: number): string => {
  if (value === 0) return '0';
  
  // Convert to scientific notation to find the first non-zero digit
  const scientific = value.toExponential();
  const [, exponent] = scientific.split('e');
  const exp = parseInt(exponent);
  
  // Calculate how many decimal places we need
  const decimalPlaces = Math.max(0, -exp + 1);
  
  // Format with exactly 2 significant digits after the first non-zero
  return value.toFixed(decimalPlaces + 1);
};

export const formatTransactionValue = (value: string): string => {
  const ethValue = parseFloat(value);
  return `${ethValue.toFixed(4)} ETH`;
};

export const shortenHash = (hash: string, chars: number = 4): string => {
  if (!hash) return "";
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
};

export const getBlockExplorerUrl = (networkName: string, hash: string): string => {
  switch (networkName.toLowerCase()) {
    case "base sepolia":
      return `https://sepolia.basescan.org/tx/${hash}`;
    case "optimism sepolia":
      return `https://sepolia-optimism.etherscan.io/tx/${hash}`;
    case "sepolia":
      return `https://sepolia.etherscan.io/tx/${hash}`;
    default:
      return `https://sepolia.etherscan.io/tx/${hash}`;
  }
};

export const formatTransactionDate = (timestamp?: number): string => {
  if (!timestamp) return "Unknown";
  
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than 1 minute
  if (diffInSeconds < 60) {
    return "Just now";
  }
  
  // Less than 1 hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  
  // Less than 24 hours
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  
  // Less than 7 days
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  
  // More than 7 days - show date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatTransactionTime = (timestamp?: number): string => {
  if (!timestamp) return "";
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}; 