import { mulberry32, randomVector } from "./random.js";

// Stands in for a learned embedding matrix. A real table is [vocabSize x dim]
// and trained; here each row is derived from the token id, so the table needs
// no fixed size and the vocabulary can keep growing between prompts.
export class EmbeddingTable {
  private readonly cache = new Map<number, number[]>();

  constructor(
    readonly dim: number,
    private readonly seed: number,
  ) {}

  lookup(tokenId: number): number[] {
    const cached = this.cache.get(tokenId);
    if (cached !== undefined) return cached;

    const row = randomVector(mulberry32(this.seed + tokenId), this.dim, 0.5);
    this.cache.set(tokenId, row);
    return row;
  }

  embed(tokenIds: number[]): number[][] {
    return tokenIds.map((id) => this.lookup(id));
  }
}
