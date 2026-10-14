import type { NaturalLanguageInput } from "../stage1-input/index.js";
import { cleanText, tokenize } from "./tokenizer.js";
import { Vocabulary } from "./vocabulary.js";
import type { PreprocessedInput } from "./types.js";

export type { PreprocessedInput };
export { Vocabulary };

export function preprocess(
  input: NaturalLanguageInput,
  vocabulary: Vocabulary,
): PreprocessedInput {
  const cleanedText = cleanText(input.raw);
  const tokens = tokenize(cleanedText);
  const tokenIds = vocabulary.encode(tokens);

  return {
    cleanedText,
    tokens,
    tokenIds,
    vocabSize: vocabulary.size,
  };
}
