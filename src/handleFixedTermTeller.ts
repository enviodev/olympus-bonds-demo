import {
  BondFixedTermTeller,
} from "generated";
import {
  BondPurchase_t,
} from "generated/src/db/Entities.gen";
import { 
  getTokenDecimals, 
  getAuctioneer, 
  getFixedTermMarketInfoForPurchase 
} from "./effects/contractCalls";
import { isOHMMarket, getAggregatorAddress } from "./helpers/ContractHelper";
import { getISO8601StringFromTimestamp, getUnixTimestamp } from "./helpers/DateHelper";
import { toDecimal } from "./helpers/NumberHelper";

const BOND_TYPE = "FixedTerm";

BondFixedTermTeller.Bonded.handler(async ({ event, context }) => {
  console.log(`Creating BondPurchase for teller contract ${event.srcAddress} and market id ${event.params.id.toString()}`);

  try {
    const marketId = event.params.id;
    
    // Get aggregator address for this teller
    const aggregatorAddress = getAggregatorAddress(event.srcAddress);
    
    // Get auctioneer from aggregator
    const auctioneerAddress = await context.effect(getAuctioneer, {
      aggregatorAddress: aggregatorAddress,
      marketId: marketId.toString(),
    });
    
    // Get market info from auctioneer
    const marketInfo = await context.effect(getFixedTermMarketInfoForPurchase, {
      tellerAddress: auctioneerAddress,
      marketId: marketId.toString(),
    });
    
    const quoteTokenAddress = marketInfo.quoteToken;
    const payoutTokenAddress = marketInfo.payoutToken;
    
    if (!isOHMMarket(payoutTokenAddress, quoteTokenAddress)) {
      console.log("Ignoring market creation for token other than OHM");
      return;
    }
    
    // Get token decimals
    const [quoteTokenDecimals, payoutTokenDecimals] = await Promise.all([
      context.effect(getTokenDecimals, quoteTokenAddress),
      context.effect(getTokenDecimals, payoutTokenAddress),
    ]);
    
    const entityId = event.transaction.hash + "-" + event.logIndex.toString();
    const vestingTimestamp = BigInt(marketInfo.vesting);
    
    const entity: BondPurchase_t = {
      id: entityId,
      date: getISO8601StringFromTimestamp(BigInt(event.block.timestamp)),
      block: BigInt(event.block.number),
      timestamp: getUnixTimestamp(BigInt(event.block.timestamp)),
      transaction: event.transaction.hash,
      contract: event.srcAddress,
      bondType: BOND_TYPE,
      marketId: marketId,
      referrer: event.params.referrer,
      amountInQuoteToken: toDecimal(event.params.amount, quoteTokenDecimals),
      payoutInPayoutToken: toDecimal(event.params.payout, payoutTokenDecimals),
      payoutToken: payoutTokenAddress,
      quoteToken: quoteTokenAddress,
      expiryTimestamp: getUnixTimestamp(vestingTimestamp),
      expiryDate: getISO8601StringFromTimestamp(BigInt(event.block.timestamp) + vestingTimestamp),
    };

    context.BondPurchase.set(entity);
  } catch (error) {
    context.log.error(`Error in Bonded handler: ${error}`);
    // Don't throw - let the indexer continue
  }
});
