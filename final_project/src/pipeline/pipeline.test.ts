import { test } from "node:test";
import assert from "node:assert/strict";
import { receiveInput } from "./stage1-input/index.js";
import { preprocess, Vocabulary } from "./stage2-preprocessing/index.js";
import { SemanticEncoder } from "./stage3-encoder/index.js";
import { GrammarGuidedDecoder } from "./stage4-decoder/index.js";
import { constructAST } from "./stage5-ast/index.js";
import { renderPython } from "./stage6-renderer/index.js";

function decode(text: string) {
  const input = preprocess(receiveInput(text), new Vocabulary());
  return new GrammarGuidedDecoder().decode(input, new SemanticEncoder().encode(input));
}

for (const [verb, operator] of [["adds", "+"], ["subtracts", "-"], ["multiplies", "*"], ["divides", "/"]]) {
  test(`full pipeline: ${verb}`, () => {
    const ast = constructAST(decode(`Create a function called calculate that ${verb} two numbers`).actions);
    assert.equal(ast.body[0].name, "calculate");
    assert.deepEqual(ast.body[0].parameters, ["a", "b"]);
    assert.equal(ast.body[0].body[0].argument.operator, operator);
    assert.deepEqual(ast.body[0].body[0].argument.left, { type: "Identifier", name: "a" });
    assert.equal(renderPython(ast), `def calculate(a, b):\n    return a ${operator} b\n`);
  });
}
test("renderer uses AST names and operand order", () => {
  const ast = constructAST(decode("function that subtracts two numbers").actions);
  ast.body[0].name = "difference";
  ast.body[0].parameters = ["first", "second"];
  ast.body[0].body[0].argument.left.name = "second";
  ast.body[0].body[0].argument.right.name = "first";
  assert.equal(renderPython(ast), "def difference(first, second):\n    return second - first\n");
});
test("renderer rejects invalid names and unbound operands", () => {
  const ast = constructAST(decode("function that adds two numbers").actions);
  ast.body[0].name = "bad\nname";
  assert.throws(() => renderPython(ast));
  ast.body[0].name = "valid_name";
  ast.body[0].body[0].argument.left.name = "unknown";
  assert.throws(() => renderPython(ast));
});
test("reject unsupported and ambiguous requests", () => {
  for (const text of ["sort a list", "add two numbers and multiply them", "function that adds two numbers then deletes files", "function called class that adds two numbers"]) {
    assert.throws(() => decode(text));
  }
});
test("reject invalid encoder output", () => {
  const input = preprocess(receiveInput("function that adds two numbers"), new Vocabulary());
  const intent = new SemanticEncoder().encode(input);
  assert.throws(() => new GrammarGuidedDecoder().decode(input, { ...intent, values: [NaN] }));
});
test("AST rejects malformed and incomplete derivations", () => {
  const actions = decode("function that adds two numbers").actions;
  assert.throws(() => constructAST([]));
  assert.throws(() => constructAST(actions.slice(0, -1)));
  assert.throws(() => constructAST([...actions, { type: "GENTOKEN", value: "extra" }]));
  assert.throws(() => constructAST([{ type: "APPLYRULE", rule: "constructor" }]));
  assert.throws(() => constructAST([{ type: "APPLYRULE", rule: "add" }]));
  for (const [index, value] of [[2, "return"], [5, "a"], [8, "unknown"], [9, "bad-name"]] as const) {
    const modified = actions.map(action => ({ ...action }));
    modified[index] = { type: "GENTOKEN", value };
    assert.throws(() => constructAST(modified));
  }
});
