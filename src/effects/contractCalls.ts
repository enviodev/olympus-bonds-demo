import { S, experimental_createEffect } from "envio";
import { createPublicClient, http, parseAbi } from "viem";

// Create a public client for reading contract state
const publicClient = createPublicClient({
  chain: {
    id: 1, // Ethereum mainnet
    name: 'Ethereum',
    network: 'homestead',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [process.env.RPC_URL || 'https://eth.llamarpc.com'],
      },
      public: {
        http: [process.env.RPC_URL || 'https://eth.llamarpc.com'],
      },
    },
  },
  transport: http(process.env.RPC_URL || 'https://eth.llamarpc.com'),
});

// ERC20 ABI for basic token functions
const ERC20_ABI = parseAbi([
  'function decimals() view returns (uint8)',
]);

// BondFixedExpirySDA ABI for market functions
const BOND_FIXED_EXPIRY_SDA_ABI = parseAbi([
  'function markets(uint256 id_) view returns (address owner, address payoutToken, address quoteToken, address callbackAddr, bool capacityInQuote, uint256 capacity, uint256 totalDebt, uint256 minPrice, uint256 maxPayout, uint256 sold, uint256 purchased, uint256 scale)',
  'function metadata(uint256 id_) view returns (uint48 lastTune, uint48 lastDecay, uint32 length, uint32 depositInterval, uint32 tuneInterval, uint32 tuneAdjustmentDelay, uint32 debtDecayInterval, uint256 tuneIntervalCapacity, uint256 tuneBelowCapacity, uint256 lastTuneDebt)',
]);

// BondFixedTermSDA ABI for market functions
const BOND_FIXED_TERM_SDA_ABI = parseAbi([
  'function markets(uint256 id_) view returns (address owner, address payoutToken, address quoteToken, address callbackAddr, bool capacityInQuote, uint256 capacity, uint256 totalDebt, uint256 minPrice, uint256 maxPayout, uint256 sold, uint256 purchased, uint256 scale)',
  'function metadata(uint256 id_) view returns (uint48 lastTune, uint48 lastDecay, uint32 length, uint32 depositInterval, uint32 tuneInterval, uint32 tuneAdjustmentDelay, uint32 debtDecayInterval, uint256 tuneIntervalCapacity, uint256 tuneBelowCapacity, uint256 lastTuneDebt)',
]);

// BondAggregator ABI for aggregator functions
const BOND_AGGREGATOR_ABI = parseAbi([
  'function getAuctioneer(uint256 marketId) view returns (address)',
]);

// BondFixedExpiryTeller ABI for market info functions
const BOND_FIXED_EXPIRY_TELLER_ABI = parseAbi([
  'function getMarketInfoForPurchase(uint256 marketId) view returns (address quoteToken, address payoutToken, uint48 vesting)',
]);

// BondFixedTermTeller ABI for market info functions (same as FixedExpiry)
const BOND_FIXED_TERM_TELLER_ABI = parseAbi([
  'function getMarketInfoForPurchase(uint256 marketId) view returns (address quoteToken, address payoutToken, uint48 vesting)',
]);

// Effect to get token decimals
export const getTokenDecimals = experimental_createEffect(
  {
    name: "getTokenDecimals",
    input: S.string, // Token contract address
    output: S.number,
  },
  async ({ input: tokenAddress, context }) => {
    try {
      const decimals = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      });
      return Number(decimals);
    } catch (error) {
      context.log.error(`Error fetching token decimals for ${tokenAddress}: ${error}`);
      return 18; // Default to 18 decimals
    }
  }
);

// Effect to get market data for FixedExpiry
export const getFixedExpiryMarketData = experimental_createEffect(
  {
    name: "getFixedExpiryMarketData",
    input: {
      contractAddress: S.string,
      marketId: S.string,
      blockNumber: S.number,
    },
    output: {
      owner: S.string,
      payoutToken: S.string,
      quoteToken: S.string,
      callbackAddr: S.string,
      capacityInQuote: S.boolean,
      capacity: S.string,
      totalDebt: S.string,
      minPrice: S.string,
      maxPayout: S.string,
      sold: S.string,
      purchased: S.string,
      scale: S.string,
    },
  },
  async ({ input, context }) => {
    try {
      const marketData = await publicClient.readContract({
        address: input.contractAddress as `0x${string}`,
        abi: BOND_FIXED_EXPIRY_SDA_ABI,
        functionName: 'markets',
        args: [BigInt(input.marketId)],
        blockNumber: BigInt(input.blockNumber),
      });

      return {
        owner: marketData[0],
        payoutToken: marketData[1],
        quoteToken: marketData[2],
        callbackAddr: marketData[3],
        capacityInQuote: marketData[4],
        capacity: marketData[5].toString(),
        totalDebt: marketData[6].toString(),
        minPrice: marketData[7].toString(),
        maxPayout: marketData[8].toString(),
        sold: marketData[9].toString(),
        purchased: marketData[10].toString(),
        scale: marketData[11].toString(),
      };
    } catch (error) {
      context.log.error(`Error fetching FixedExpiry market data for ${input.contractAddress} market ${input.marketId}: ${error}`);
      throw error;
    }
  }
);

// Effect to get market data for FixedTerm
export const getFixedTermMarketData = experimental_createEffect(
  {
    name: "getFixedTermMarketData",
    input: {
      contractAddress: S.string,
      marketId: S.string,
      blockNumber: S.number,
    },
    output: {
      owner: S.string,
      payoutToken: S.string,
      quoteToken: S.string,
      callbackAddr: S.string,
      capacityInQuote: S.boolean,
      capacity: S.string,
      totalDebt: S.string,
      minPrice: S.string,
      maxPayout: S.string,
      sold: S.string,
      purchased: S.string,
      scale: S.string,
    },
  },
  async ({ input, context }) => {
    try {
      const marketData = await publicClient.readContract({
        address: input.contractAddress as `0x${string}`,
        abi: BOND_FIXED_TERM_SDA_ABI,
        functionName: 'markets',
        args: [BigInt(input.marketId)],
        blockNumber: BigInt(input.blockNumber),
      });
      
      return {
        owner: marketData[0],
        payoutToken: marketData[1],
        quoteToken: marketData[2],
        callbackAddr: marketData[3],
        capacityInQuote: marketData[4],
        capacity: marketData[5].toString(),
        totalDebt: marketData[6].toString(),
        minPrice: marketData[7].toString(),
        maxPayout: marketData[8].toString(),
        sold: marketData[9].toString(),
        purchased: marketData[10].toString(),
        scale: marketData[11].toString(),
      };
    } catch (error) {
      context.log.error(`Error fetching FixedTerm market data for ${input.contractAddress} market ${input.marketId}: ${error}`);
      throw error;
    }
  }
);

// Effect to get market metadata for FixedExpiry
export const getFixedExpiryMarketMetadata = experimental_createEffect(
  {
    name: "getFixedExpiryMarketMetadata",
    input: {
      contractAddress: S.string,
      marketId: S.string,
      blockNumber: S.number,
    },
    output: {
      lastTune: S.string,
      lastDecay: S.string,
      length: S.string,
      depositInterval: S.string,
      tuneInterval: S.string,
      tuneAdjustmentDelay: S.string,
      debtDecayInterval: S.string,
      tuneIntervalCapacity: S.string,
      tuneBelowCapacity: S.string,
      lastTuneDebt: S.string,
    },
  },
  async ({ input, context }) => {
    try {
      const metadata = await publicClient.readContract({
        address: input.contractAddress as `0x${string}`,
        abi: BOND_FIXED_EXPIRY_SDA_ABI,
        functionName: 'metadata',
        args: [BigInt(input.marketId)],
        blockNumber: BigInt(input.blockNumber),
      });

      return {
        lastTune: metadata[0].toString(),
        lastDecay: metadata[1].toString(),
        length: metadata[2].toString(),
        depositInterval: metadata[3].toString(),
        tuneInterval: metadata[4].toString(),
        tuneAdjustmentDelay: metadata[5].toString(),
        debtDecayInterval: metadata[6].toString(),
        tuneIntervalCapacity: metadata[7].toString(),
        tuneBelowCapacity: metadata[8].toString(),
        lastTuneDebt: metadata[9].toString(),
      };
    } catch (error) {
      context.log.error(`Error fetching FixedExpiry market metadata for ${input.contractAddress} market ${input.marketId}: ${error}`);
      throw error;
    }
  }
);

// Effect to get market metadata for FixedTerm
export const getFixedTermMarketMetadata = experimental_createEffect(
  {
    name: "getFixedTermMarketMetadata",
    input: {
      contractAddress: S.string,
      marketId: S.string,
      blockNumber: S.number,
    },
    output: {
      lastTune: S.string,
      lastDecay: S.string,
      length: S.string,
      depositInterval: S.string,
      tuneInterval: S.string,
      tuneAdjustmentDelay: S.string,
      debtDecayInterval: S.string,
      tuneIntervalCapacity: S.string,
      tuneBelowCapacity: S.string,
      lastTuneDebt: S.string,
    },
  },
  async ({ input, context }) => {
    try {
      const metadata = await publicClient.readContract({
        address: input.contractAddress as `0x${string}`,
        abi: BOND_FIXED_TERM_SDA_ABI,
        functionName: 'metadata',
        args: [BigInt(input.marketId)],
        blockNumber: BigInt(input.blockNumber),
      });

      return {
        lastTune: metadata[0].toString(),
        lastDecay: metadata[1].toString(),
        length: metadata[2].toString(),
        depositInterval: metadata[3].toString(),
        tuneInterval: metadata[4].toString(),
        tuneAdjustmentDelay: metadata[5].toString(),
        debtDecayInterval: metadata[6].toString(),
        tuneIntervalCapacity: metadata[7].toString(),
        tuneBelowCapacity: metadata[8].toString(),
        lastTuneDebt: metadata[9].toString(),
      };
    } catch (error) {
      context.log.error(`Error fetching FixedTerm market metadata for ${input.contractAddress} market ${input.marketId}: ${error}`);
      throw error;
    }
  }
);

// Effect to get auctioneer from aggregator
export const getAuctioneer = experimental_createEffect(
  {
    name: "getAuctioneer",
    input: {
      aggregatorAddress: S.string,
      marketId: S.string,
    },
    output: S.string,
  },
  async ({ input, context }) => {
    try {
      const auctioneer = await publicClient.readContract({
        address: input.aggregatorAddress as `0x${string}`,
        abi: BOND_AGGREGATOR_ABI,
        functionName: 'getAuctioneer',
        args: [BigInt(input.marketId)],
      });
      
      return auctioneer;
    } catch (error) {
      context.log.error(`Error fetching auctioneer for ${input.aggregatorAddress} market ${input.marketId}: ${error}`);
      throw error;
    }
  }
);

// Effect to get market info for purchase from FixedExpiry Teller
export const getFixedExpiryMarketInfoForPurchase = experimental_createEffect(
  {
    name: "getFixedExpiryMarketInfoForPurchase",
    input: {
      tellerAddress: S.string,
      marketId: S.string,
    },
    output: {
      quoteToken: S.string,
      payoutToken: S.string,
      vesting: S.string,
    },
  },
  async ({ input, context }) => {
    try {
      const marketInfo = await publicClient.readContract({
        address: input.tellerAddress as `0x${string}`,
        abi: BOND_FIXED_EXPIRY_TELLER_ABI,
        functionName: 'getMarketInfoForPurchase',
        args: [BigInt(input.marketId)],
      });
      
      return {
        quoteToken: marketInfo[0],
        payoutToken: marketInfo[1],
        vesting: marketInfo[2].toString(),
      };
    } catch (error) {
      context.log.error(`Error fetching FixedExpiry market info for purchase for ${input.tellerAddress} market ${input.marketId}: ${error}`);
      throw error;
    }
  }
);

// Effect to get market info for purchase from FixedTerm Teller
export const getFixedTermMarketInfoForPurchase = experimental_createEffect(
  {
    name: "getFixedTermMarketInfoForPurchase",
    input: {
      tellerAddress: S.string,
      marketId: S.string,
    },
    output: {
      quoteToken: S.string,
      payoutToken: S.string,
      vesting: S.string,
    },
  },
  async ({ input, context }) => {
    try {
      const marketInfo = await publicClient.readContract({
        address: input.tellerAddress as `0x${string}`,
        abi: BOND_FIXED_TERM_TELLER_ABI,
        functionName: 'getMarketInfoForPurchase',
        args: [BigInt(input.marketId)],
      });
      
      return {
        quoteToken: marketInfo[0],
        payoutToken: marketInfo[1],
        vesting: marketInfo[2].toString(),
      };
    } catch (error) {
      context.log.error(`Error fetching FixedTerm market info for purchase for ${input.tellerAddress} market ${input.marketId}: ${error}`);
      throw error;
    }
  }
);
