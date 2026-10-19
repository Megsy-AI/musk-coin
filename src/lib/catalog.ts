// NFT catalog (prices in GRAM). Images are resolved in the UI.
export const NFTS = [
  { id: "astro", name: "Astro Spirit", rarity: "Legendary", price: 50 },
  { id: "crown", name: "Crown Spirit", rarity: "Epic", price: 25 },
  { id: "chrome", name: "Chrome Spirit", rarity: "Rare", price: 12 },
  { id: "cool", name: "Cool Spirit", rarity: "Rare", price: 8 },
  { id: "beat", name: "Beat Spirit", rarity: "Common", price: 3 },
] as const;

// Wallet that receives GRAM deposits. Empty = deposits show "coming soon".
export const DEPOSIT_ADDRESS = "UQAp1QxnLJ2z44IooUovvtVShw7hJBEdxCRV3RlbCYC3D8qj";
