let expr = '';
let justCalculated = false;
let isDegree = true;

function toggleMode() {
  isDegree = !isDegree;
  document.getElementById('modeToggle').textContent = isDegree ? 'DEG' : 'RAD';
}

function toRad(angle) {
  return isDegree ? (angle * Math.PI / 180) : angle;
}

function updateDisplay() {
  document.getElementById('expression').textContent = expr;
}

function appendNum(n) {
  if (justCalculated) {
    expr = '';
    justCalculated = false;
  }
  expr += n;
  updateDisplay();
  document.getElementById('result').textContent = expr;
}

function appendOp(op) {
  justCalculated = false;
  const last = expr.slice(-1);
  if (['+', '−', '×', '÷', '%', '^'].includes(last)) {
    expr = expr.slice(0, -1);
  }
  expr += op;
  updateDisplay();
  document.getElementById('result').textContent = expr;
}

function appendFunc(fn) {
  if (justCalculated) justCalculated = false;
  expr += fn;
  updateDisplay();
  document.getElementById('result').textContent = expr;
}

function appendConstant(c) {
  if (justCalculated) {
    expr = '';
    justCalculated = false;
  }
  expr += c;
  updateDisplay();
  document.getElementById('result').textContent = expr;
}

function appendDot() {
  const parts = expr.split(/[+\-×÷%^]/);
  if (parts[parts.length - 1].includes('.')) return;
  if (!expr || ['+', '−', '×', '÷', '%', '^'].includes(expr.slice(-1))) {
    expr += '0';
  }
  expr += '.';
  updateDisplay();
  document.getElementById('result').textContent = expr;
}

function deleteLast() {
  if (justCalculated) {
    clearAll();
    return;
  }
  // Remove last character or full function like sin(
  if (expr.endsWith('sin(') || expr.endsWith('cos(') || expr.endsWith('tan(') || expr.endsWith('log(') || expr.endsWith('abs(')) {
    expr = expr.slice(0, -4);
  } else if (expr.endsWith('ln(') || expr.endsWith('√(')) {
    expr = expr.slice(0, -3);
  } else {
    expr = expr.slice(0, -1);
  }
  updateDisplay();
  document.getElementById('result').textContent = expr || '0';
}

function clearAll() {
  expr = '';
  justCalculated = false;
  updateDisplay();
  document.getElementById('result').textContent = '0';
}

function calculate() {
  if (!expr) return;
  try {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/%/g, '/100')
      .replace(/\^/g, '**')
      .replace(/π/g, Math.PI)
      .replace(/e/g, Math.E)
      .replace(/sin\(/g, `Math.sin(toRad(`)
      .replace(/cos\(/g, `Math.cos(toRad(`)
      .replace(/tan\(/g, `Math.tan(toRad(`)
      .replace(/log\(/g, `Math.log10(`)
      .replace(/ln\(/g, `Math.log(`)
      .replace(/√\(/g, `Math.sqrt(`)
      .replace(/abs\(/g, `Math.abs(`);

    // Close extra brackets added by sin/cos/tan toRad wrapping
    const sinCount = (expr.match(/sin\(/g) || []).length;
    const cosCount = (expr.match(/cos\(/g) || []).length;
    const tanCount = (expr.match(/tan\(/g) || []).length;
    sanitized += ')'.repeat(sinCount + cosCount + tanCount);

    let val = Function('"use strict"; return (' + sanitized + ')')();
    const display = parseFloat(val.toFixed(10)).toString();

    document.getElementById('expression').textContent = expr + ' =';
    document.getElementById('result').textContent = display;
    expr = display;
    justCalculated = true;
  } catch (e) {
    document.getElementById('result').textContent = 'Error';
    expr = '';
    justCalculated = true;
  }
}

// Keyboard Support
document.addEventListener('keydown', function(e) {
  if (e.key >= '0' && e.key <= '9') appendNum(e.key);
  else if (e.key === '+') appendOp('+');
  else if (e.key === '-') appendOp('−');
  else if (e.key === '*') appendOp('×');
  else if (e.key === '/') { e.preventDefault(); appendOp('÷'); }
  else if (e.key === '%') appendOp('%');
  else if (e.key === '(') appendOp('(');
  else if (e.key === ')') appendOp(')');
  else if (e.key === '.') appendDot();
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearAll();
});