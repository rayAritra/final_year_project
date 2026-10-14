import { isIdentifier } from "../stage4-decoder/index.js";
import type { Program } from "../stage5-ast/index.js";

/** Render the closed arithmetic AST as Python, with a final newline. */
export function renderPython(program: Program): string {
  if (program.type !== "Program" || program.body.length !== 1) {
    throw new Error("Expected a program containing one function.");
  }
  const fn = program.body[0];
  if (fn.type !== "FunctionDeclaration" || !isIdentifier(fn.name) ||
      fn.parameters.length !== 2 || !fn.parameters.every(isIdentifier) ||
      new Set(fn.parameters).size !== 2 || fn.body.length !== 1) {
    throw new Error("Invalid function declaration.");
  }
  const statement = fn.body[0];
  const expression = statement.argument;
  if (statement.type !== "ReturnStatement" || expression.type !== "BinaryExpression" ||
      !["+", "-", "*", "/"].includes(expression.operator)) {
    throw new Error("Unsupported return expression.");
  }
  for (const operand of [expression.left, expression.right]) {
    if (operand.type !== "Identifier" || !isIdentifier(operand.name) ||
        !fn.parameters.includes(operand.name)) {
      throw new Error("Expected an identifier bound to a function parameter.");
    }
  }
  return `def ${fn.name}(${fn.parameters.join(", ")}):\n    return ${expression.left.name} ${expression.operator} ${expression.right.name}\n`;
}
