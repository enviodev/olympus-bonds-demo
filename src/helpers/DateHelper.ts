/**
 * Returns in YYYY-MM-DD format
 *
 * @param date
 * @returns
 */
export const getISO8601String = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const getDateFromUnixTimestamp = (timestamp: bigint): Date => {
  return new Date(Number(timestamp) * 1000);
};

export const getISO8601DateStringFromTimestamp = (timestamp: bigint): string => {
  return getISO8601String(getDateFromUnixTimestamp(timestamp));
};

export const getISO8601StringFromTimestamp = (timestamp: bigint): string => {
  return getDateFromUnixTimestamp(timestamp).toISOString();
};

export function getUnixTimestamp(timestamp: bigint): bigint {
  return timestamp * BigInt(1000);
}
