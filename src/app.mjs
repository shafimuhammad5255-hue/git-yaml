import { calculate, formatResult } from "./calculator.mjs";

const display = document.querySelector("#display");
const keys = document.querySelector(".keys");
const operatorButtons = [...document.querySelectorAll("[data-operator]")];
let currentInput = "0";
let storedValue = null;
let selectedOperator = null;
let waitingForOperand = false;
let hasError = false;

function render() {
  display.textContent = currentInput;
  for (const button of operatorButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.operator === selectedOperator));
  }
}

function clear() {
  currentInput = "0";
  storedValue = null;
  selectedOperator = null;
  waitingForOperand = false;
  hasError = false;
  render();
}

function enterDigit(digit) {
  if (hasError) clear();
  if (waitingForOperand) {
    currentInput = digit === "." ? "0." : digit;
    waitingForOperand = false;
  } else if (digit === ".") {
    if (!currentInput.includes(".")) currentInput += ".";
  } else {
    currentInput = currentInput === "0" ? digit : currentInput + digit;
  }
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
    } catch {
      currentInput = "Error";
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
  render();
}

function equals() {
  if (hasError || selectedOperator === null || waitingForOperand) return;
  try {
    currentInput = formatResult(calculate(storedValue, selectedOperator, Number(currentInput)));
    storedValue = null;
    selectedOperator = null;
    waitingForOperand = true;
  } catch {
    currentInput = "Error";
    storedValue = null;
    selectedOperator = null;
    waitingForOperand = true;
    hasError = true;
  }
  render();
}

function deleteLastDigit() {
  if (hasError) {
    clear();
    return;
  }
  if (waitingForOperand) return;
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
  if (currentInput === "-") currentInput = "0";
  render();
}

function changeSign() {
  if (hasError) return;
  if (Number(currentInput) !== 0) {
    currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : `-${currentInput}`;
    waitingForOperand = false;
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
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.]$/.test(event.key)) enterDigit(event.key);
  else if (["+", "-", "*", "/"].includes(event.key)) setOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") equals();
  else if (event.key === "Backspace") deleteLastDigit();
  else if (event.key === "Escape") clear();
  else return;
  event.preventDefault();
});
