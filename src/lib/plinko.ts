// Shared Plinko + mining rules (pure, browser-safe).
export const PLINKO_ROWS = 12;
export const PLINKO_MULTIPLIERS = [16, 4, 2, 1.4, 1.1, 0.6, 0.4, 0.6, 1.1, 1.4, 2, 4, 16];
export const PLINKO_MIN_BET = 10;
export const PLINKO_MAX_BET = 10000;

/** path: array of 0 (left) / 1 (right) per row. Slot = number of rights. */
export function slotFromPath(path: number[]) {
  return path.reduce((a, b) => a + b, 0);
}

export function payoutFor(bet: number, slot: number) {
  return Math.floor(bet * PLINKO_MULTIPLIERS[slot] * 100) / 100;
}

export const MINING_DURATION_MS = 8 * 60 * 60 * 1000;
export const MINING_REWARD = 1000; // coins per full session

export function minedAmount(startedAt: number | null, now: number) {
  if (startedAt == null) return 0;
  const elapsed = Math.min(Math.max(now - startedAt, 0), MINING_DURATION_MS);
  return Math.floor((elapsed / MINING_DURATION_MS) * MINING_REWARD * 100) / 100;
}
