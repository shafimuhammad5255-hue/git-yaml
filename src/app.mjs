import { appendDigit, calculate, formatResult, percentage, squareRoot } from "./calculator.mjs";

const display = document.querySelector("#display");
const keys = document.querySelector(".keys");
const operatorButtons = [...document.querySelectorAll("[data-operator]")];
const historyList = document.querySelector("#history-list");
const clearHistoryButton = document.querySelector("#clear-history");
const expressionDisplay = document.querySelector("#expression");
const copyResultButton = document.querySelector("#copy-result");
const copyStatus = document.querySelector("#copy-status");
const history = [];
const historyLimit = 10;
const operatorSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };
let currentInput = "0";
let storedValue = null;
let selectedOperator = null;
let waitingForOperand = false;
let hasError = false;
let expressionText = "";

function render() {
  display.textContent = currentInput;
  expressionDisplay.textContent = expressionText;
  for (const button of operatorButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.operator === selectedOperator));
  }
}

function updatePendingExpression() {
  if (selectedOperator === null || storedValue === null) return;
  const left = formatResult(storedValue);
  expressionText = waitingForOperand
    ? `${left} ${operatorSymbols[selectedOperator]}`
    : `${left} ${operatorSymbols[selectedOperator]} ${currentInput}`;
}

function renderHistory() {
  historyList.replaceChildren();
  if (history.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "history-empty";
    emptyMessage.textContent = "Your calculations will appear here";
    historyList.append(emptyMessage);
    return;
  }

  for (const entry of history) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "history-entry";
    button.type = "button";
    button.textContent = `${entry.expression} = ${entry.result}`;
    button.setAttribute("aria-label", `Use result ${entry.result}`);
    button.addEventListener("click", () => {
      currentInput = entry.result;
      storedValue = null;
      selectedOperator = null;
      waitingForOperand = false;
      hasError = false;
      expressionText = `${entry.expression} =`;
      render();
    });
    item.append(button);
    historyList.append(item);
  }
}

function addHistory(expression, result) {
  history.unshift({ expression, result });
  if (history.length > historyLimit) history.pop();
  renderHistory();
}

function clear() {
  currentInput = "0";
  storedValue = null;
  selectedOperator = null;
  waitingForOperand = false;
  hasError = false;
  expressionText = "";
  render();
}

function enterDigit(digit) {
  if (hasError) clear();
  if (waitingForOperand) {
    if (selectedOperator === null) expressionText = "";
    currentInput = digit === "." ? "0." : digit;
    waitingForOperand = false;
  } else {
    try {
      currentInput = appendDigit(currentInput, digit);
    } catch {
      currentInput = "Error";
      storedValue = null;
      selectedOperator = null;
      waitingForOperand = true;
      hasError = true;
      expressionText = "Number is too large";
      render();
      return;
    }
  }
  updatePendingExpression();
  render();
}

function setOperator(operator) {
  if (hasError) return;
  const inputValue = Number(currentInput);

  if (selectedOperator && !waitingForOperand) {
    try {
      const result = calculate(storedValue, selectedOperator, inputValue);
      currentInput = formatResult(result);
      storedValue = result;
      expressionText = `${formatResult(result)} ${operatorSymbols[operator]}`;
    } catch {
      currentInput = "Error";
      expressionText = `${formatResult(storedValue)} ${operatorSymbols[selectedOperator]} ${inputValue}`;
      hasError = true;
      selectedOperator = null;
      render();
      return;
    }
  } else if (storedValue === null) {
    storedValue = inputValue;
  }

  selectedOperator = operator;
  waitingForOperand = true;
  updatePendingExpression();
  render();
}

function equals() {
  if (hasError || selectedOperator === null || waitingForOperand) return;
  const expression = `${formatResult(storedValue)} ${operatorSymbols[selectedOperator]} ${currentInput}`;
  expressionText = `${expression} =`;
  try {
    currentInput = formatResult(calculate(storedValue, selectedOperator, Number(currentInput)));
    addHistory(expression, currentInput);
    storedValue = null;
    selectedOperator = null;
    waitingForOperand = true;
  } catch {
    currentInput = "Error";
    expressionText = `${expression} =`;
    storedValue = null;
    selectedOperator = null;
    waitingForOperand = true;
    hasError = true;
  }
  render();
}

function applyUnaryOperation(operation) {
  if (hasError) return;
  const originalInput = currentInput;
  const historyExpression = operation === "sqrt" ? `√(${originalInput})` : `${originalInput}%`;
  try {
    const value = Number(currentInput);
    const result = operation === "sqrt" ? squareRoot(value) : percentage(value);
    currentInput = formatResult(result);
    waitingForOperand = false;
    expressionText = selectedOperator
      ? `${formatResult(storedValue)} ${operatorSymbols[selectedOperator]} ${currentInput}`
      : `${historyExpression} =`;
    addHistory(historyExpression, currentInput);
  } catch {
    currentInput = "Error";
    expressionText = `${historyExpression} =`;
    storedValue = null;
    selectedOperator = null;
    waitingForOperand = true;
    hasError = true;
  }
  render();
}

function clearEntry() {
  currentInput = "0";
  hasError = false;
  waitingForOperand = false;
  if (selectedOperator === null) expressionText = "";
  else updatePendingExpression();
  render();
}

async function copyResult() {
  if (hasError) {
    copyStatus.textContent = "There is no result to copy.";
    return;
  }
  try {
    await navigator.clipboard.writeText(currentInput);
    copyStatus.textContent = "Result copied.";
  } catch {
    copyStatus.textContent = "Could not copy. Check clipboard permissions.";
  }
}

function deleteLastDigit() {
  if (hasError) {
    clear();
    return;
  }
  if (waitingForOperand) return;
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
  if (currentInput === "-") currentInput = "0";
  updatePendingExpression();
  render();
}

function changeSign() {
  if (hasError) return;
  if (Number(currentInput) !== 0) {
    currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : `-${currentInput}`;
    waitingForOperand = false;
    if (selectedOperator === null) expressionText = "";
    else updatePendingExpression();
    render();
  }
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.digit !== undefined) enterDigit(button.dataset.digit);
  else if (button.dataset.operator) setOperator(button.dataset.operator);
  else if (button.dataset.action === "clear") clear();
  else if (button.dataset.action === "delete") deleteLastDigit();
  else if (button.dataset.action === "sign") changeSign();
  else if (button.dataset.action === "equals") equals();
  else if (button.dataset.action === "percent") applyUnaryOperation("percent");
  else if (button.dataset.action === "sqrt") applyUnaryOperation("sqrt");
  else if (button.dataset.action === "clear-entry") clearEntry();
});

clearHistoryButton.addEventListener("click", () => {
  history.length = 0;
  renderHistory();
});

copyResultButton.addEventListener("click", copyResult);

renderHistory();

document.addEventListener("keydown", (event) => {
  if (/^[0-9.]$/.test(event.key)) enterDigit(event.key);
  else if (["+", "-", "*", "/"].includes(event.key)) setOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") equals();
  else if (event.key === "Backspace") deleteLastDigit();
  else if (event.key === "Delete") clearEntry();
  else if (event.key === "%") applyUnaryOperation("percent");
  else if (event.key.toLowerCase() === "r") applyUnaryOperation("sqrt");
  else if (event.key === "Escape") clear();
  else return;
  event.preventDefault();
});
