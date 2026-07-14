import { BigDecimal } from "envio";
import { toDecimal } from "./NumberHelper";

export function getId(
    contract: string,
    bondType: string,
    marketId: bigint,
): string {
    return `${contract}/${bondType}/${marketId.toString()}`;
};

/**
 * Converts a price integer (in terms of the quote token per payout token) to a BigDecimal.
 * 
 * Explanation from Oighty:
 * > The price decimal scaling for a market is split between
 * > the price value and the scale value to be able to support a broader range of inputs.
 * > Specifically, half of it is in the scale and half in the price.
 * > To normalize the price value for display, we can add the half that is in the scale factor back to it.
 * 
 * The resulting number is then shifted by 36 decimal places.
 * 
 * @param number
 * @param scale
 */
export function priceToDecimal(
    number: bigint,
    scale: bigint,
    payoutTokenDecimals: number,
    quoteTokenDecimals: number,
): BigDecimal {
    const PRICE_DECIMALS: number = 36;

    // ERC20.decimals() returns a uint8, so we can cast here
    const baseScale = BigInt(10) ** BigInt(PRICE_DECIMALS + payoutTokenDecimals - quoteTokenDecimals);
    const shift = baseScale / scale;

    return toDecimal(number * shift, PRICE_DECIMALS);
}

/**
 * Converts an integer (in terms of the payout token) to a BigDecimal.
 * 
 * This can be applied to: max payout, total debt, capacity
 * 
 * @param number 
 * @param payoutTokenDecimals 
 * @returns 
 */
export function payoutTokenToDecimal(
    number: bigint,
    payoutTokenDecimals: number,
): BigDecimal {
    return toDecimal(number, payoutTokenDecimals);
}
