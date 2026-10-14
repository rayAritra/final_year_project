// Word-level tokenizer. Stands in for a real sub-word tokenizer (e.g. BPE)
// which would be swapped in later without changing the pipeline shape.

export function cleanText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(cleanedText: string): string[] {
  if (cleanedText.length === 0) return [];
  return cleanedText.split(" ");
}
