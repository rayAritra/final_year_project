# Natural Language to Code Pipeline

Run `npm run demo`, `npm run build`, and `npm test`.

## Status

1. Input: implemented.
2. Cleaning, word tokenization, and vocabulary IDs: implemented.
3. Semantic encoder: seeded random embeddings and RNN/mean pooling prototype; not trained.
4. Grammar-guided decoder: deterministic baseline producing APPLYRULE/GENTOKEN actions for a closed Python arithmetic-function grammar. It validates encoder output but uses text patterns for intent selection, not learned vector decoding.
5. AST construction: implemented for the closed grammar, with production, completion, identifier, duplicate-parameter, and bound-variable checks.
6. Code rendering: implemented for the closed AST grammar, emitting Python functions with four-space indentation and a final newline.
7. Post-processing: pending.
8. Evaluation: pending. Unit/integration tests are not a model-quality evaluation.

## Supported Requests

Examples:

- Create a function that adds two numbers
- Write a function called calculate that subtracts two integers
- Define a function that multiplies two numbers and returns the result
- A function to divide two numbers

The baseline supports add/sum, subtract, multiply, and divide, with optional names via `called NAME` or `named NAME`. It uses parameters `a` and `b` in that order. Unsupported requests fail explicitly. Division follows Python `/` semantics; zero-division behavior will need runtime handling if desired. The CLI displays the AST and generated Python source; it does not automatically execute that source. No training data, trained decoder, arbitrary language understanding, loops, or conditionals are included.

For `Create a function that adds two numbers`, stage 6 emits:

```python
def add_numbers(a, b):
    return a + b
```
