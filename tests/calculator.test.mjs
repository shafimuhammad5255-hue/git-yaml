import assert from "node:assert/strict";
import test from "node:test";
import { calculate, formatResult, percentage, squareRoot } from "../src/calculator.mjs";

test("adds positive and negative numbers", () => {
  assert.equal(calculate(12, "+", 8), 20);
  assert.equal(calculate(-4, "+", 9), 5);
});

test("subtracts numbers", () => {
  assert.equal(calculate(12, "-", 8), 4);
});

test("multiplies numbers", () => {
  assert.equal(calculate(7, "*", 6), 42);
});

test("divides numbers", () => {
  assert.equal(calculate(20, "/", 4), 5);
});

test("converts values to percentages", () => {
  assert.equal(percentage(25), 0.25);
  assert.equal(percentage(-50), -0.5);
});

test("calculates square roots", () => {
  assert.equal(squareRoot(81), 9);
  assert.equal(squareRoot(0), 0);
});

test("rejects square roots of negative numbers", () => {
  assert.throws(() => squareRoot(-1), {
    name: "RangeError",
    message: "Cannot calculate the square root of a negative number",
  });
});

test("rejects non-finite unary operation inputs", () => {
  assert.throws(() => percentage(Infinity), TypeError);
  assert.throws(() => squareRoot(NaN), TypeError);
});

test("rejects division by zero", () => {
  assert.throws(() => calculate(1, "/", 0), {
    name: "RangeError",
    message: "Cannot divide by zero",
  });
});

test("rejects unsupported operators", () => {
  assert.throws(() => calculate(1, "%", 2), RangeError);
});

test("rejects non-finite inputs and results", () => {
  assert.throws(() => calculate(Infinity, "+", 1), TypeError);
  assert.throws(() => calculate(Number.MAX_VALUE, "*", 2), RangeError);
});

test("formats floating-point results cleanly", () => {
  assert.equal(formatResult(0.1 + 0.2), "0.3");
  assert.equal(formatResult(100), "100");
});
