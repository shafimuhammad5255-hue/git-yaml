const OPERATIONS = {
  "+": (left, right) => left + right,
  "-": (left, right) => left - right,
  "*": (left, right) => left * right,
  "/": (left, right) => {
    if (right === 0) throw new RangeError("Cannot divide by zero");
    return left / right;
  },
};

export function calculate(left, operator, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    throw new TypeError("Calculator inputs must be finite numbers");
  }

  const operation = OPERATIONS[operator];
  if (!operation) throw new RangeError(`Unsupported operator: ${operator}`);

  const result = operation(left, right);
  if (!Number.isFinite(result)) throw new RangeError("Result is outside the supported range");
  return result;
}

export function formatResult(value) {
  if (!Number.isFinite(value)) throw new TypeError("Calculator result must be a finite number");
  return String(Number(value.toPrecision(12)));
}
