/**
 * Asset tables from Bencho's "Asset swap" block.
 *
 * `lot` is the amount offered for the payer of each group, so a pair is a
 * crossed spot trade: the receive side is worth 99.7% of the pay side.
 */

export type AssetKind = "crypto" | "currency";

export type Asset = {
  sym: string;
  name: string;
  /** USD price per unit. */
  price: number;
  /** Decimal places used by the amount formatter. */
  dp: number;
  /** Units in one trade. */
  lot: number;
  kind: AssetKind;
};

export const CRYPTO: Asset[] = [
  {
    sym: "BTC",
    name: "Bitcoin",
    price: 97700,
    dp: 5,
    lot: 0.05,
    kind: "crypto",
  },
  {
    sym: "ETH",
    name: "Ethereum",
    price: 3368.64,
    dp: 4,
    lot: 1.5,
    kind: "crypto",
  },
  {
    sym: "HYPE",
    name: "Hyperliquid",
    price: 38.2,
    dp: 3,
    lot: 100,
    kind: "crypto",
  },
  { sym: "ZEC", name: "Zcash", price: 52.4, dp: 3, lot: 40, kind: "crypto" },
  { sym: "QNT", name: "Quant", price: 104.5, dp: 3, lot: 20, kind: "crypto" },
];

export const CURRENCY: Asset[] = [
  {
    sym: "USD",
    name: "US Dollar",
    price: 1,
    dp: 2,
    lot: 1000,
    kind: "currency",
  },
  { sym: "EUR", name: "Euro", price: 1.08, dp: 2, lot: 1000, kind: "currency" },
  {
    sym: "JPY",
    name: "Japanese Yen",
    price: 0.0067,
    dp: 0,
    lot: 150000,
    kind: "currency",
  },
  {
    sym: "GBP",
    name: "British Pound",
    price: 1.27,
    dp: 2,
    lot: 1000,
    kind: "currency",
  },
  {
    sym: "CAD",
    name: "Canadian Dollar",
    price: 0.73,
    dp: 2,
    lot: 1000,
    kind: "currency",
  },
];

export type AssetGroup = {
  list: Asset[];
  /** The two symbols shown when the group mounts, top first. */
  start: [string, string];
};

export const ASSET_GROUPS: Record<"Crypto" | "Currency", AssetGroup> = {
  Crypto: { list: CRYPTO, start: ["BTC", "HYPE"] },
  Currency: { list: CURRENCY, start: ["USD", "EUR"] },
};

/** The gallery ships the block's default group. */
export const GROUP = ASSET_GROUPS.Crypto;

export const ASSETS: Asset[] = [...CRYPTO, ...CURRENCY];

export const BY_SYM: Record<string, Asset> = Object.fromEntries(
  ASSETS.map((asset) => [asset.sym, asset]),
);

/** Crypto keeps trailing zeros off; currencies always show their cents. */
export function formatAmount(asset: Asset, value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: asset.kind === "currency" ? asset.dp : 0,
    maximumFractionDigits: asset.dp,
  });
}

export function formatFiat(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export type Side = {
  asset: Asset;
  amount: string;
  fiat: string;
};

/**
 * Payer offers its full `lot`; the receiver gets the same USD value less the
 * 0.3% spread, priced in its own units.
 */
export function sideValues(pair: string[], payer: number): [Side, Side] {
  const payerAsset = BY_SYM[pair[payer]];
  const pot = payerAsset.lot * payerAsset.price;

  const side = (index: number): Side => {
    const asset = BY_SYM[pair[index]];
    const value = index === payer ? pot : pot * 0.997;
    const units = index === payer ? asset.lot : value / asset.price;
    return {
      asset,
      amount: formatAmount(asset, units),
      fiat: formatFiat(value),
    };
  };

  return [side(0), side(1)];
}
