import { 
  OHM_V2, 
  BOND_AGGREGATOR_V1, 
  BOND_AGGREGATOR_V2,
  FIXED_EXPIRY_TELLER_V1,
  FIXED_EXPIRY_TELLER_V2,
  FIXED_TERM_TELLER_V1,
  FIXED_TERM_TELLER_V2
} from "../constants";

export function isOHMMarket(payoutToken: string, quoteToken: string): boolean {
    // If neither token is OHM, this isn't an OHM market
    if (payoutToken.toLowerCase() != OHM_V2.toLowerCase() && quoteToken.toLowerCase() != OHM_V2.toLowerCase()) {
        return false;
    }

    return true;
}

export function getAggregatorAddress(tellerContract: string): string {
    const tellerLower = tellerContract.toLowerCase();
    
    if (tellerLower === FIXED_EXPIRY_TELLER_V1.toLowerCase() || tellerLower === FIXED_TERM_TELLER_V1.toLowerCase()) {
        return BOND_AGGREGATOR_V1;
    }
    
    if (tellerLower === FIXED_EXPIRY_TELLER_V2.toLowerCase() || tellerLower === FIXED_TERM_TELLER_V2.toLowerCase()) {
        return BOND_AGGREGATOR_V2;
    }
    
    throw new Error(`Unknown teller contract: ${tellerContract}`);
}
