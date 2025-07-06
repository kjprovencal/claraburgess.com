/**
 * Formats a price to show either 0 decimals for whole numbers or 2 decimals for fractional amounts
 * @param price - The price value to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  // Check if the price is a whole number
  if (Number.isInteger(price)) {
    return `$${price}`;
  }

  // For fractional amounts, show 2 decimal places
  return `$${price.toFixed(2)}`;
};
