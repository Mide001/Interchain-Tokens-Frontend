export const formatEthValue = (value: number): string => {
  if (value === 0) return '0';
  
  // Convert to scientific notation to find the first non-zero digit
  const scientific = value.toExponential();
  const [coefficient, exponent] = scientific.split('e');
  const exp = parseInt(exponent);
  
  // Calculate how many decimal places we need
  const decimalPlaces = Math.max(0, -exp + 1);
  
  // Format with exactly 2 significant digits after the first non-zero
  return value.toFixed(decimalPlaces + 1);
}; 