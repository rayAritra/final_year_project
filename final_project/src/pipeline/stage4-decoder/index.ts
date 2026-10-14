import type { PreprocessedInput } from "../stage2-preprocessing/index.js";
import type { IntentVector } from "../stage3-encoder/index.js";

export type SymbolName = "Program" | "Function" | "Parameters" | "Statement" | "Expression" | "Identifier";
export type Action =
  | { type: "APPLYRULE"; rule: string }
  | { type: "GENTOKEN"; value: string };

// Closed grammar for Python functions with two arguments and one return.
export const GRAMMAR: Readonly<Record<string, { lhs: SymbolName; rhs: readonly SymbolName[] }>> = Object.freeze({
  program: { lhs: "Program", rhs: ["Function"] },
  function: { lhs: "Function", rhs: ["Identifier", "Parameters", "Statement"] },
  parameters: { lhs: "Parameters", rhs: ["Identifier", "Identifier"] },
  return: { lhs: "Statement", rhs: ["Expression"] },
  add: { lhs: "Expression", rhs: ["Identifier", "Identifier"] },
  subtract: { lhs: "Expression", rhs: ["Identifier", "Identifier"] },
  multiply: { lhs: "Expression", rhs: ["Identifier", "Identifier"] },
  divide: { lhs: "Expression", rhs: ["Identifier", "Identifier"] },
});

const RESERVED = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case type".split(" "));
export function isIdentifier(value: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value) && !RESERVED.has(value);
}

export interface DecodedProgram {
  targetLanguage: "python";
  strategy: "deterministic-baseline";
  actions: Action[];
}

export class GrammarGuidedDecoder {
  decode(input: PreprocessedInput, intent: IntentVector): DecodedProgram {
    if (intent.dim <= 0 || intent.values.length !== intent.dim ||
        intent.values.some(value => !Number.isFinite(value)) || intent.tokenCount !== input.tokens.length) {
      throw new Error("Invalid or mismatched encoder output.");
    }
    // Random encoder weights cannot provide learned semantics. Keep the
    // baseline explicit and reject requests outside its narrow contract.
    const text = input.cleanedText;
    const match = /^(?:write |create |define )?(?:a )?function(?: (?:called|named) ([a-z][a-z0-9]*))? (?:that |to )?(adds?|sums?|subtracts?|multiplies|multiply|divides?|computes the sum of) two (?:numbers|integers)(?: (?:and returns|returning) (?:the )?(?:result|sum|difference|product|quotient))?$/.exec(text);
    if (!match) {
      throw new Error("Unsupported request. Supported: a function that adds, subtracts, multiplies, or divides two numbers, optionally named using 'called NAME'.");
    }
    const verb = match[2];
    const operation = /^(add|sum|compute)/.test(verb) ? "add"
      : verb.startsWith("subtract") ? "subtract"
      : verb.startsWith("multipl") ? "multiply" : "divide";
    const name = match[1] ?? `${operation}_numbers`;
    if (!isIdentifier(name)) throw new Error("Function name is not a valid Python identifier.");
    const rule = (rule: string): Action => ({ type: "APPLYRULE", rule });
    const token = (value: string): Action => ({ type: "GENTOKEN", value });
    return {
      targetLanguage: "python",
      strategy: "deterministic-baseline",
      actions: [rule("program"), rule("function"), token(name), rule("parameters"),
        token("a"), token("b"), rule("return"), rule(operation), token("a"), token("b")],
    };
  }
}
