export const getNetworkName = (chainId: number) => {
  switch (chainId) {
    case 11155111:
      return 'Sepolia';
    case 1:
      return 'Mainnet';
    case 17000:
      return 'Holesky';
    case 5:
      return 'Goerli';
    default:
      return 'Unknown';
  }
};
