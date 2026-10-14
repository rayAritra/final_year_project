import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { receiveInput } from "./pipeline/stage1-input/index.js";
import { preprocess, Vocabulary } from "./pipeline/stage2-preprocessing/index.js";
import { SemanticEncoder, cosineSimilarity } from "./pipeline/stage3-encoder/index.js";
import type { IntentVector } from "./pipeline/stage3-encoder/index.js";
import { GrammarGuidedDecoder } from "./pipeline/stage4-decoder/index.js";
import { constructAST } from "./pipeline/stage5-ast/index.js";
import { renderPython } from "./pipeline/stage6-renderer/index.js";

const rl = createInterface({ input: stdin, output: stdout });
const vocabulary = new Vocabulary();
const encoder = new SemanticEncoder();
const decoder = new GrammarGuidedDecoder();

// Kept so each prompt can be compared against the one before it -- the
// quickest way to see that the intent vector actually reacts to the wording.
let previous: { text: string; intent: IntentVector } | null = null;

const PREVIEW_DIMS = 6;

function formatVector(values: number[]): string {
  const head = values
    .slice(0, PREVIEW_DIMS)
    .map((value) => value.toFixed(3).padStart(6))
    .join(", ");
  return `[${head}, ... ] (${values.length} dims)`;
}

console.log("Natural Language -> Code Pipeline (Stages 1-6 baseline demo)");
console.log('Type a description and press Enter. Leave blank or type "exit" to quit.\n');

// Iterating the interface (rather than awaiting rl.question per turn) keeps
// every buffered line when input is piped in, and ends cleanly on EOF.
rl.setPrompt("> ");
rl.prompt();

for await (const raw of rl) {
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.toLowerCase() === "exit") {
    break;
  }

  console.log("=".repeat(60));

  // Stage 1: Natural Language Input
  const nlInput = receiveInput(raw);
  console.log("[Stage 1] Natural Language Input");
  console.log("  raw:", nlInput.raw);

  // Stage 2: Text Preprocessing & Tokenization
  const preprocessed = preprocess(nlInput, vocabulary);
  console.log("[Stage 2] Text Preprocessing & Tokenization");
  console.log("  cleanedText:", preprocessed.cleanedText);
  console.log("  tokens:     ", preprocessed.tokens);
  console.log("  tokenIds:   ", preprocessed.tokenIds);
  console.log(
    "  vocabSize:  ",
    preprocessed.vocabSize,
    `(${preprocessed.vocabSize - 1} words + <unk>)`,
  );

  // Stage 3: Semantic Encoder
  const intent = encoder.encode(preprocessed);
  console.log("[Stage 3] Semantic Encoder");
  console.log("  architecture:", intent.architecture);
  console.log("  tokenCount:  ", intent.tokenCount);
  console.log("  intentVector:", formatVector(intent.values));
  if (previous !== null) {
    const similarity = cosineSimilarity(previous.intent.values, intent.values);
    console.log(
      `  cosine vs previous ("${previous.text}"): ${similarity.toFixed(4)}`,
    );
  }
  previous = { text: preprocessed.cleanedText, intent };

  try {
    const decoded = decoder.decode(preprocessed, intent);
    console.log("[Stage 4] Grammar-Guided Decoder:", decoded.strategy);
    console.log(JSON.stringify(decoded.actions, null, 2));
    const ast = constructAST(decoded.actions);
    console.log("[Stage 5] Abstract Syntax Tree");
    console.log(JSON.stringify(ast, null, 2));
    console.log("[Stage 6] Code Rendering (Python)");
    console.log(renderPython(ast));
  } catch (error) {
    console.error("Code generation failed:", error instanceof Error ? error.message : error);
  }

  console.log("=".repeat(60), "\n");
  rl.prompt();
}

console.log(
  "Next stage (not yet implemented): Post-Processing",
);
rl.close();
