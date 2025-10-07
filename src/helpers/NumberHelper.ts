import { BigDecimal } from "generated";

export const DEFAULT_DECIMALS = 18;
export const ZERO_BI = BigInt(0);
export const ONE_BI = BigInt(1);
export const ZERO_BD = new BigDecimal(0);
export const ONE_BD = new BigDecimal(1);

/**
 * Converts the given BigInt to a BigDecimal.
 *
 * If the `decimals` parameter is specified, that will be used instead of `DEFAULT_DECIMALS`.
 *
 * @param value
 * @param decimals
 * @returns
 */
export function toDecimal(value: bigint, decimals: number = DEFAULT_DECIMALS): BigDecimal {
  if (decimals === 0) {
    return new BigDecimal(value.toString());
  }
  const precision = BigInt(10) ** BigInt(decimals);
  return new BigDecimal(value.toString()).div(new BigDecimal(precision.toString()));
}
