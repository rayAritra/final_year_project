export type InputSource = "cli" | "docstring" | "ticket" | "api";

export interface NaturalLanguageInput {
  raw: string;
  source: InputSource;
  receivedAt: Date;
}
