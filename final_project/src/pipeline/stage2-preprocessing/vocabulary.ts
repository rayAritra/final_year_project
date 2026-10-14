export const UNKNOWN_TOKEN = "<unk>";

export class Vocabulary {
  private tokenToId = new Map<string, number>([[UNKNOWN_TOKEN, 0]]);
  private idToToken = new Map<number, string>([[0, UNKNOWN_TOKEN]]);

  get size(): number {
    return this.tokenToId.size;
  }

  private add(token: string): number {
    const existing = this.tokenToId.get(token);
    if (existing !== undefined) return existing;

    const id = this.tokenToId.size;
    this.tokenToId.set(token, id);
    this.idToToken.set(id, token);
    return id;
  }

  encode(tokens: string[]): number[] {
    return tokens.map((token) => this.add(token));
  }

  decode(ids: number[]): string[] {
    return ids.map((id) => this.idToToken.get(id) ?? UNKNOWN_TOKEN);
  }
}
