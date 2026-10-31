import assert from "node:assert/strict";
import test from "node:test";
import { appendDigit, calculate, formatResult, percentage, squareRoot } from "../src/calculator.mjs";

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

test("supports chained operations from left to right", () => {
  const firstResult = calculate(12, "+", 8);
  assert.equal(calculate(firstResult, "*", 2), 40);
});

test("appends digits and prevents duplicate decimal points", () => {
  assert.equal(appendDigit("12", "3"), "123");
  assert.equal(appendDigit("12.3", "."), "12.3");
  assert.equal(appendDigit("0", "."), "0.");
});

test("rejects digit entry that exceeds the finite number range", () => {
  let input = "9";
  assert.throws(() => {
    for (let index = 0; index < 400; index += 1) input = appendDigit(input, "9");
  }, {
    name: "RangeError",
    message: "Number is outside the supported range",
  });
});

test("rejects invalid digit input", () => {
  assert.throws(() => appendDigit("12", "+"), RangeError);
});

test("converts values to percentages", () => {
  assert.equal(percentage(25), 0.25);
  assert.equal(percentage(-50), -0.5);
  assert.equal(percentage(0), 0);
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
  assert.equal(formatResult(Number.MAX_VALUE), "1.79769313486e+308");
});

test("rejects non-finite values when formatting results", () => {
  assert.throws(() => formatResult(Infinity), TypeError);
});
