const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const historyList = document.getElementById("history-list");
const keypad = document.querySelector(".keypad");

let currentExpression = "";
let lastResult = null;
const history = [];

function updateDisplay() {
  expressionEl.textContent = currentExpression;
  resultEl.textContent = lastResult !== null ? lastResult : currentExpression || "0";
}

function addHistoryItem(expr, res) {
  history.unshift({ expr, res });
  if (history.length > 15) {
    history.pop();
  }

  historyList.innerHTML = "";
  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";

    const exp = document.createElement("div");
    exp.className = "history-expression";
    exp.textContent = item.expr;

    const resDiv = document.createElement("div");
    resDiv.className = "history-result";
    resDiv.textContent = item.res;

    div.appendChild(exp);
    div.appendChild(resDiv);
    historyList.appendChild(div);
  });
}

function insertValue(value) {
  currentExpression += value;
  lastResult = null;
  updateDisplay();
}

function wrapFunction(fnName) {
  if (!currentExpression) {
    currentExpression = fnName + "(";
  } else {
    currentExpression += fnName + "(";
  }
  lastResult = null;
  updateDisplay();
}

function clearEntry() {
  currentExpression = currentExpression.slice(0, -1);
  lastResult = null;
  updateDisplay();
}

function clearAll() {
  currentExpression = "";
  lastResult = null;
  updateDisplay();
}

function normalizeExpression(expr) {
  let normalized = expr;

  normalized = normalized.replace(/π/g, "Math.PI");
  normalized = normalized.replace(/sin\(/g, "Math.sin(");
  normalized = normalized.replace(/cos\(/g, "Math.cos(");
  normalized = normalized.replace(/tan\(/g, "Math.tan(");
  normalized = normalized.replace(/log\(/g, "Math.log10(");
  normalized = normalized.replace(/ln\(/g, "Math.log(");
  normalized = normalized.replace(/√\(/g, "Math.sqrt(");
  normalized = normalized.replace(/√/g, "Math.sqrt");
  normalized = normalized.replace(/(\d+|\))\^(\d+|\()/g, "$1**$2");

  return normalized;
}

function evaluateExpression() {
  if (!currentExpression) {
    return;
  }

  let exprToEval = currentExpression;

  try {
    exprToEval = normalizeExpression(exprToEval);
    const result = Function(`"use strict"; return (${exprToEval})`)();
    if (Number.isFinite(result)) {
      const rounded = Math.round(result * 1e10) / 1e10;
      lastResult = rounded.toString();
      addHistoryItem(currentExpression, lastResult);
      currentExpression = lastResult;
      updateDisplay();
    }
  } catch (e) {}
}

keypad.addEventListener("click", event => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const value = target.getAttribute("data-value");
  const op = target.getAttribute("data-op");
  const fn = target.getAttribute("data-fn");
  const action = target.getAttribute("data-action");

  if (value !== null) {
    insertValue(value);
    return;
  }

  if (op !== null) {
    insertValue(op);
    return;
  }

  if (fn !== null) {
    if (fn === "sqrt") {
      insertValue("√(");
      return;
    }
    if (fn === "pi") {
      insertValue("π");
      return;
    }
    if (fn === "pow") {
      insertValue("^");
      return;
    }
    wrapFunction(fn);
    return;
  }

  if (action === "clear") {
    clearEntry();
    return;
  }

  if (action === "clear-all") {
    clearAll();
    return;
  }

  if (action === "equals") {
    evaluateExpression();
  }
});

updateDisplay();