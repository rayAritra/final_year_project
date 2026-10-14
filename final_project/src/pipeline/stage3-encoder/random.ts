// Seeded PRNG (mulberry32). The encoder has no trained weights, so every
// matrix is generated from a fixed seed instead -- that keeps runs
// reproducible and lets weights be derived on demand rather than stored.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Values in [-limit, limit), the usual shape for untrained weight init. */
export function randomVector(
  next: () => number,
  size: number,
  limit: number,
): number[] {
  const out = new Array<number>(size);
  for (let i = 0; i < size; i++) {
    out[i] = (next() * 2 - 1) * limit;
  }
  return out;
}
