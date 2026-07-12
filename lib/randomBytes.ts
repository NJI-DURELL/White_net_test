const SEED_POOL_SIZE = 65536;

let seedPool: Uint8Array | null = null;

function getSeedPool(): Uint8Array {
  if (!seedPool) {
    seedPool = new Uint8Array(SEED_POOL_SIZE);
    crypto.getRandomValues(seedPool);
  }
  return seedPool;
}

/**
 * Fast Edge-safe pseudo-random byte buffer.
 * True crypto.getRandomValues() is capped (~64KB per call in most engines),
 * so for larger chunks we tile a crypto-seeded pool with a cheap per-tile
 * offset — the payload doesn't need to be cryptographically random, just
 * incompressible/non-repeating enough to reflect real throughput.
 */
export function randomChunk(size: number): Uint8Array {
  const pool = getSeedPool();
  const out = new Uint8Array(size);
  const offset = Math.floor(Math.random() * pool.length);
  for (let i = 0; i < size; i++) {
    out[i] = pool[(offset + i) % pool.length] ^ (i & 0xff);
  }
  return out;
}
