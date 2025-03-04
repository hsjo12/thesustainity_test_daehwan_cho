export const getRequiredETH = (pricePerToken: bigint, tokenAmount: bigint) => {
  return (pricePerToken * tokenAmount) / BigInt(1e18);
};
