/** matrix is [rows x cols] flattened row-major; vector length must be cols. */
export function matVec(
  matrix: number[],
  vector: number[],
  rows: number,
  cols: number,
): number[] {
  const out = new Array<number>(rows).fill(0);
  for (let r = 0; r < rows; r++) {
    let sum = 0;
    const offset = r * cols;
    for (let c = 0; c < cols; c++) {
      sum += matrix[offset + c]! * vector[c]!;
    }
    out[r] = sum;
  }
  return out;
}

export function addInPlace(target: number[], other: number[]): number[] {
  for (let i = 0; i < target.length; i++) {
    target[i]! += other[i]!;
  }
  return target;
}

export function tanhInPlace(target: number[]): number[] {
  for (let i = 0; i < target.length; i++) {
    target[i] = Math.tanh(target[i]!);
  }
  return target;
}

/** Scales to unit length so vectors are comparable by cosine similarity. */
export function l2Normalize(vector: number[]): number[] {
  let sumOfSquares = 0;
  for (const value of vector) sumOfSquares += value * value;

  const norm = Math.sqrt(sumOfSquares);
  if (norm === 0) return vector.slice();
  return vector.map((value) => value / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Cannot compare vectors of different dimensions (${a.length} vs ${b.length}).`,
    );
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}
