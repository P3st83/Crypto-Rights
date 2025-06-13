// Import contract ABIs
import CryptoRightsAbi from '../../artifacts/contracts/CryptoRights.sol/CryptoRights.json';
import CryptoRightsSubscriptionAbi from '../../artifacts/contracts/CryptoRightsSubscription.sol/CryptoRightsSubscription.json';
import CryptoRightsAuctionAbi from '../../artifacts/contracts/CryptoRightsAuction.sol/CryptoRightsAuction.json';

// Contract addresses (these would typically come from deployment or environment variables)
export const CONTRACT_ADDRESSES = {
  cryptoRights: process.env.NEXT_PUBLIC_CRYPTO_RIGHTS_ADDRESS || '',
  cryptoRightsSubscription: process.env.NEXT_PUBLIC_CRYPTO_RIGHTS_SUBSCRIPTION_ADDRESS || '',
  cryptoRightsAuction: process.env.NEXT_PUBLIC_CRYPTO_RIGHTS_AUCTION_ADDRESS || '',
};

// Export ABIs
export const CONTRACT_ABIS = {
  cryptoRights: CryptoRightsAbi.abi,
  cryptoRightsSubscription: CryptoRightsSubscriptionAbi.abi,
  cryptoRightsAuction: CryptoRightsAuctionAbi.abi,
};

// Export a function to get contract configuration
export const getContractConfig = () => {
  return {
    addresses: CONTRACT_ADDRESSES,
    abis: CONTRACT_ABIS,
  };
};

export default getContractConfig; 