import { addInPlace, l2Normalize, matVec, tanhInPlace } from "./math.js";
import { mulberry32, randomVector } from "./random.js";
import type { EncoderArchitecture } from "./types.js";

// Single-layer recurrent encoder:
//
//   h_t = tanh(Wx . x_t + Wh . h_(t-1) + b)
//
// The final hidden state is the intent vector. Weights are untrained (seeded
// noise), so the numbers carry no learned meaning yet -- what this stage
// provides is the shape and the ordering behaviour the decoder depends on:
// a fixed-width vector out of a variable-length token sequence, where moving
// a token changes the result.
export class RecurrentEncoder {
  readonly architecture: EncoderArchitecture = "rnn";

  private readonly inputWeights: number[];
  private readonly hiddenWeights: number[];
  private readonly bias: number[];

  constructor(
    readonly dim: number,
    seed: number,
  ) {
    const next = mulberry32(seed);
    const limit = 1 / Math.sqrt(dim);
    this.inputWeights = randomVector(next, dim * dim, limit);
    this.hiddenWeights = randomVector(next, dim * dim, limit);
    this.bias = randomVector(next, dim, limit);
  }

  run(sequence: number[][]): number[] {
    let hidden = new Array<number>(this.dim).fill(0);

    for (const step of sequence) {
      const next = matVec(this.inputWeights, step, this.dim, this.dim);
      addInPlace(next, matVec(this.hiddenWeights, hidden, this.dim, this.dim));
      addInPlace(next, this.bias);
      hidden = tanhInPlace(next);
    }

    return l2Normalize(hidden);
  }
}

/** Order-insensitive baseline, useful for comparing against the RNN. */
export function meanPool(sequence: number[][], dim: number): number[] {
  if (sequence.length === 0) return new Array<number>(dim).fill(0);

  const total = new Array<number>(dim).fill(0);
  for (const step of sequence) addInPlace(total, step);

  return l2Normalize(total.map((value) => value / sequence.length));
}
