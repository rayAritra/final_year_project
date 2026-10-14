import type { PreprocessedInput } from "../stage2-preprocessing/index.js";
import { EmbeddingTable } from "./embeddings.js";
import { RecurrentEncoder, meanPool } from "./encoder.js";
import { cosineSimilarity } from "./math.js";
import type { EncoderArchitecture, IntentVector } from "./types.js";

export type { EncoderArchitecture, IntentVector };
export { EmbeddingTable, RecurrentEncoder, cosineSimilarity, meanPool };

export const DEFAULT_DIM = 32;

export interface SemanticEncoderOptions {
  dim?: number;
  seed?: number;
  architecture?: EncoderArchitecture;
}

export class SemanticEncoder {
  readonly dim: number;
  readonly architecture: EncoderArchitecture;

  private readonly embeddings: EmbeddingTable;
  private readonly rnn: RecurrentEncoder;

  constructor(options: SemanticEncoderOptions = {}) {
    const { dim = DEFAULT_DIM, seed = 7, architecture = "rnn" } = options;
    if (!Number.isInteger(dim) || dim <= 0) {
      throw new RangeError(`Encoder dim must be a positive integer, got ${dim}.`);
    }

    this.dim = dim;
    this.architecture = architecture;
    // Offset the seeds so the embedding rows and the recurrent weights are
    // not drawn from the same stream.
    this.embeddings = new EmbeddingTable(dim, seed);
    this.rnn = new RecurrentEncoder(dim, seed + 9973);
  }

  encode(preprocessed: PreprocessedInput): IntentVector {
    const sequence = this.embeddings.embed(preprocessed.tokenIds);
    const values =
      this.architecture === "rnn"
        ? this.rnn.run(sequence)
        : meanPool(sequence, this.dim);

    return {
      values,
      dim: this.dim,
      tokenCount: preprocessed.tokenIds.length,
      architecture: this.architecture,
    };
  }
}
