import type { InputSource, NaturalLanguageInput } from "./types.js";

export type { InputSource, NaturalLanguageInput };

export class EmptyInputError extends Error {
  constructor() {
    super("Natural language input cannot be empty.");
    this.name = "EmptyInputError";
  }
}

export function receiveInput(
  raw: string,
  source: InputSource = "cli",
): NaturalLanguageInput {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new EmptyInputError();
  }

  return {
    raw: trimmed,
    source,
    receivedAt: new Date(),
  };
}
