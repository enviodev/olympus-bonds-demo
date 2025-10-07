import {
  BondFixedTermSDA,
} from "generated";
import {
  Market_t,
  MarketCreatedEvent_t,
  MarketClosedEvent_t,
} from "generated/src/db/Entities.gen";
import { 
  getTokenDecimals, 
  getFixedTermMarketData, 
  getFixedTermMarketMetadata 
} from "./effects/contractCalls";
import { isOHMMarket } from "./helpers/ContractHelper";
import { getISO8601StringFromTimestamp, getUnixTimestamp } from "./helpers/DateHelper";
import { getId, payoutTokenToDecimal, priceToDecimal } from "./helpers/MarketHelper";
import { toDecimal, ZERO_BD } from "./helpers/NumberHelper";

const BOND_TYPE = "FixedTerm";

BondFixedTermSDA.MarketCreated.handler(async ({ event, context }) => {
  if (!isOHMMarket(event.params.payoutToken, event.params.quoteToken)) {
    console.log("Ignoring market creation for token other than OHM");
    return;
  }

  try {
    const marketId = getId(event.srcAddress, BOND_TYPE, event.params.id);
    
            // Get market data and metadata from contract
            const [marketData, marketMetadata, payoutTokenDecimals, quoteTokenDecimals] = await Promise.all([
              context.effect(getFixedTermMarketData, {
                contractAddress: event.srcAddress,
                marketId: event.params.id.toString(),
                blockNumber: event.block.number,
              }),
              context.effect(getFixedTermMarketMetadata, {
                contractAddress: event.srcAddress,
                marketId: event.params.id.toString(),
                blockNumber: event.block.number,
              }),
              context.effect(getTokenDecimals, event.params.payoutToken),
              context.effect(getTokenDecimals, event.params.quoteToken),
            ]);
    
    const market: Market_t = {
      id: marketId,
      bondContract: event.srcAddress,
      bondType: BOND_TYPE,
      marketId: event.params.id,
      owner: marketData.owner,
      payoutToken: event.params.payoutToken,
      quoteToken: event.params.quoteToken,
      vesting: event.params.vesting,
      durationMilliseconds: BigInt(marketMetadata.length) * BigInt(1000), // Convert seconds to milliseconds
      capacityInPayoutToken: payoutTokenToDecimal(BigInt(marketData.capacity), payoutTokenDecimals),
      totalDebtInPayoutToken: payoutTokenToDecimal(BigInt(marketData.totalDebt), payoutTokenDecimals),
      maxPayoutInPayoutToken: payoutTokenToDecimal(BigInt(marketData.maxPayout), payoutTokenDecimals),
      initialPriceInQuoteToken: priceToDecimal(event.params.initialPrice, BigInt(marketData.scale), payoutTokenDecimals, quoteTokenDecimals),
      minPriceInQuoteToken: priceToDecimal(BigInt(marketData.minPrice), BigInt(marketData.scale), payoutTokenDecimals, quoteTokenDecimals),
      soldInPayoutToken: ZERO_BD,
      purchasedInQuoteToken: ZERO_BD,
      createdDate: getISO8601StringFromTimestamp(BigInt(event.block.timestamp)),
      createdTimestamp: getUnixTimestamp(BigInt(event.block.timestamp)),
      createdBlock: BigInt(event.block.number),
      closedBlock: undefined,
      closedDate: undefined,
      closedTimestamp: undefined,
      durationActualMilliseconds: undefined,
    };

    const marketCreated: MarketCreatedEvent_t = {
      id: marketId,
      marketId: event.params.id,
      market_id: marketId,
      bondContract: event.srcAddress,
      bondType: BOND_TYPE,
      date: getISO8601StringFromTimestamp(BigInt(event.block.timestamp)),
      timestamp: getUnixTimestamp(BigInt(event.block.timestamp)),
      block: BigInt(event.block.number),
    };

    context.Market.set(market);
    context.MarketCreatedEvent.set(marketCreated);
    console.log(`Created market with id ${market.id}`);
  } catch (error) {
    context.log.error(`Error in MarketCreated handler: ${error}`);
    // Don't throw - let the indexer continue
  }
});

BondFixedTermSDA.MarketClosed.handler(async ({ event, context }) => {
  const marketId = getId(event.srcAddress, BOND_TYPE, event.params.id);
  const market = await context.Market.get(marketId);
  
  // If there is no existing market, then it is going to be for a non-OHM token
  if (!market) {
    console.log("Ignoring market closure where there is no existing market record (likely token other than OHM)");
    return;
  }

  try {
            // Get final market data to calculate sold/purchased amounts
            const [marketData, payoutTokenDecimals, quoteTokenDecimals] = await Promise.all([
              context.effect(getFixedTermMarketData, {
                contractAddress: event.srcAddress,
                marketId: event.params.id.toString(),
                blockNumber: event.block.number,
              }),
              context.effect(getTokenDecimals, market.payoutToken),
              context.effect(getTokenDecimals, market.quoteToken),
            ]);

    const marketClosed: MarketClosedEvent_t = {
      id: marketId,
      marketId: event.params.id,
      market_id: marketId,
      bondContract: event.srcAddress,
      bondType: BOND_TYPE,
      date: getISO8601StringFromTimestamp(BigInt(event.block.timestamp)),
      timestamp: getUnixTimestamp(BigInt(event.block.timestamp)),
      block: BigInt(event.block.number),
    };

    // Update the market with closure data and final amounts
    const updatedMarket: Market_t = {
      ...market,
      closedBlock: BigInt(event.block.number),
      closedDate: getISO8601StringFromTimestamp(BigInt(event.block.timestamp)),
      closedTimestamp: getUnixTimestamp(BigInt(event.block.timestamp)),
      durationActualMilliseconds: getUnixTimestamp(BigInt(event.block.timestamp)) - market.createdTimestamp,
      soldInPayoutToken: payoutTokenToDecimal(BigInt(marketData.sold), payoutTokenDecimals),
      purchasedInQuoteToken: toDecimal(BigInt(marketData.purchased), quoteTokenDecimals),
    };

    context.MarketClosedEvent.set(marketClosed);
    context.Market.set(updatedMarket);
  } catch (error) {
    context.log.error(`Error in MarketClosed handler: ${error}`);
    // Don't throw - let the indexer continue
  }
});
