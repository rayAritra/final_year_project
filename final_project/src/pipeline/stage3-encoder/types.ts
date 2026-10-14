export interface IntentVector {
  /** Dense representation of what the user asked for. Length === dim. */
  values: number[];
  dim: number;
  /** How many tokens were folded into this vector. */
  tokenCount: number;
  architecture: EncoderArchitecture;
}

export type EncoderArchitecture = "rnn" | "mean-pool";
