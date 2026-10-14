import { GRAMMAR, isIdentifier } from "../stage4-decoder/index.js";
import type { Action, SymbolName } from "../stage4-decoder/index.js";

export interface BinaryExpression {
  type: "BinaryExpression";
  operator: "+" | "-" | "*" | "/";
  left: { type: "Identifier"; name: string };
  right: { type: "Identifier"; name: string };
}
export interface Program {
  type: "Program";
  body: [{ type: "FunctionDeclaration"; name: string; parameters: [string, string];
    body: [{ type: "ReturnStatement"; argument: BinaryExpression }] }];
}

export function constructAST(actions: readonly Action[]): Program {
  let cursor = 0;
  function consume(symbol: SymbolName): { rule: string; children: Node[]; value: string } {
    const action = actions[cursor++];
    if (!action) throw new Error(`Incomplete derivation: expected ${symbol}.`);
    if (symbol === "Identifier") {
      if (action.type !== "GENTOKEN" || !isIdentifier(action.value)) {
        throw new Error("Expected a valid identifier token.");
      }
      return { rule: "", children: [], value: action.value };
    }
    if (action.type !== "APPLYRULE") throw new Error(`Expected a production for ${symbol}.`);
    const production = Object.hasOwn(GRAMMAR, action.rule) ? GRAMMAR[action.rule] : undefined;
    if (!production || production.lhs !== symbol) throw new Error(`Illegal production ${action.rule} for ${symbol}.`);
    return { rule: action.rule, children: production.rhs.map(consume), value: "" };
  }
  type Node = ReturnType<typeof consume>;
  const tree = consume("Program");
  if (cursor !== actions.length) throw new Error("Trailing actions after complete program.");
  const fn = tree.children[0];
  const parameters = fn.children[1].children.map(node => node.value) as [string, string];
  if (parameters[0] === parameters[1]) throw new Error("Duplicate function parameters.");
  const expression = fn.children[2].children[0];
  const [left, right] = expression.children.map(node => node.value);
  if (!parameters.includes(left) || !parameters.includes(right)) throw new Error("Unbound identifier in expression.");
  const operators: Record<string, BinaryExpression["operator"]> = { add: "+", subtract: "-", multiply: "*", divide: "/" };
  return { type: "Program", body: [{ type: "FunctionDeclaration", name: fn.children[0].value,
    parameters, body: [{ type: "ReturnStatement", argument: { type: "BinaryExpression",
      operator: operators[expression.rule], left: { type: "Identifier", name: left },
      right: { type: "Identifier", name: right } } }] }] };
}
