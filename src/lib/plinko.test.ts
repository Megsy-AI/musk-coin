import { describe, it, expect } from "vitest";
import { PLINKO_MULTIPLIERS, payoutFor, slotFromPath, minedAmount, MINING_DURATION_MS, MINING_REWARD } from "./plinko";

describe("plinko rules", () => {
  it("has 13 slots for 12 rows", () => expect(PLINKO_MULTIPLIERS.length).toBe(13));
  it("edge slot pays 16x", () => expect(payoutFor(100, 0)).toBe(1600));
  it("center slot pays 0.4x", () => expect(payoutFor(100, 6)).toBe(40));
  it("slot counts right moves", () => expect(slotFromPath([1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(3));
});

describe("mining", () => {
  it("full session gives 1000 coins", () => expect(minedAmount(0, MINING_DURATION_MS)).toBe(MINING_REWARD));
  it("caps at 8 hours", () => expect(minedAmount(0, MINING_DURATION_MS * 3)).toBe(1000));
  it("half session gives 500", () => expect(minedAmount(0, MINING_DURATION_MS / 2)).toBe(500));
});
