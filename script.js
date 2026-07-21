/**
 * AURA Smart Calculator
 * Clean, structured modular ES6 entry point importing components.
 */

  

  // ==========================================================================
  // 1. CONFIGURATION & ABSTRACTIONS
  // ==========================================================================
  
  // Math Functions Lookup Table
  const MATH_FUNCTIONS = {
    sin: (val, isDeg) => Math.sin(isDeg ? (val * Math.PI) / 180 : val),
    cos: (val, isDeg) => Math.cos(isDeg ? (val * Math.PI) / 180 : val),
    tan: (val, isDeg) => {
      if (isDeg && Math.abs((val % 180) - 90) < 1e-9) {
        throw new Error("Undefined value");
      }
      return Math.tan(isDeg ? (val * Math.PI) / 180 : val);
    },
    log: (val) => {
      if (val <= 0) throw new Error("Log(x) x > 0");
      return Math.log10(val);
    },
    ln: (val) => {
      if (val <= 0) throw new Error("Ln(x) x > 0");
      return Math.log(val);
    },
    sqrt: (val) => {
      if (val < 0) throw new Error("Sqrt(x) x >= 0");
      return Math.sqrt(val);
    }
  };

  // Unit Converter Coefficients
  const UNIT_CONFIGS = {
    length: {
      units: {
        m: { name: 'Meter (m)', factor: 1 },
        km: { name: 'Kilometer (km)', factor: 1000 },
        cm: { name: 'Centimeter (cm)', factor: 0.01 },
        mm: { name: 'Millimeter (mm)', factor: 0.001 },
        mi: { name: 'Mile (mi)', factor: 1609.344 },
        yd: { name: 'Yard (yd)', factor: 0.9144 },
        ft: { name: 'Foot (ft)', factor: 0.3048 },
        in: { name: 'Inch (in)', factor: 0.0254 }
      }
    },
    weight: {
      units: {
        g: { name: 'Gram (g)', factor: 1 },
        kg: { name: 'Kilogram (kg)', factor: 1000 },
        lb: { name: 'Pound (lb)', factor: 453.59237 },
        oz: { name: 'Ounce (oz)', factor: 28.349523125 },
        st: { name: 'Stone (st)', factor: 6350.29318 }
      }
    },
    temperature: {
      units: {
        C: { name: 'Celsius (°C)' },
        F: { name: 'Fahrenheit (°F)' },
        K: { name: 'Kelvin (K)' }
      }
    }
  };

  // Keyboard mapping selector queries
  const KEY_MAPPINGS = {
    '.': 'button[data-insert="."]',
    '+': 'button[data-insert="+"]',
    '-': 'button[data-insert="-"]',
    '*': 'button[data-insert="*"]',
    '/': 'button[data-insert="/"]',
    '(': 'button[data-insert="("]',
    ')': 'button[data-insert=")"]',
    '^': 'button[data-insert="^"]',
    '%': 'button[data-insert="%"]',
    'Enter': 'button[data-action="evaluate"]',
    '=': 'button[data-action="evaluate"]',
    'Backspace': 'button[data-action="delete"]',
    'Escape': 'button[data-action="clear"]'
  };

  // ==========================================================================
  // 2. STATE MANAGEMENT
  // ==========================================================================
  
  const state = {
    calculator: {
      expression: '0',
      lastAnswer: '0',
      angleMode: 'DEG',
      isErrorState: false
    },
    graphing: {
      expression: 'x * sin(x)',
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      dragStartMinX: 0,
      dragStartMaxX: 0,
      dragStartMinY: 0,
      dragStartMaxY: 0
    },
    activeTab: 'calculator',
    history: []
  };

  // ==========================================================================
  // 3. DOM ELEMENTS CACHE
  // ==========================================================================
  
  const elements = {
    appContainer: document.querySelector('.app-container'),
    themeToggle: document.getElementById('btn-theme-toggle'),
    iconMoon: document.querySelector('.icon-moon'),
    iconSun: document.querySelector('.icon-sun'),
    tabs: document.querySelectorAll('.nav-tab'),
    panels: document.querySelectorAll('.tab-panel'),
    
    // Calculator Display
    calcHistory: document.getElementById('calc-history'),
    calcDisplay: document.getElementById('calc-display'),
    calcButtons: document.querySelectorAll('.button-grid .btn'),
    btnDegRad: document.getElementById('btn-deg-rad'),
    
    // Graphing Module
    graphExpression: document.getElementById('graph-expression'),
    btnPlot: document.getElementById('btn-plot'),
    btnZoomIn: document.getElementById('btn-zoom-in'),
    btnZoomOut: document.getElementById('btn-zoom-out'),
    btnResetZoom: document.getElementById('btn-reset-zoom'),
    graphCanvas: document.getElementById('graph-canvas'),
    
    // Unit Converter Module
    converterType: document.getElementById('converter-type'),
    converterFromValue: document.getElementById('converter-from-value'),
    converterToValue: document.getElementById('converter-to-value'),
    converterFromUnit: document.getElementById('converter-from-unit'),
    converterToUnit: document.getElementById('converter-to-unit'),
    btnConverterSwap: document.getElementById('btn-converter-swap'),
    
    // History Sidebar
    btnHistoryToggle: document.getElementById('btn-history-toggle'),
    btnHistoryClose: document.getElementById('btn-history-close'),
    btnHistoryClear: document.getElementById('btn-history-clear'),
    historySidebar: document.getElementById('history-sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    historyList: document.getElementById('history-list')
  };

  const ctx = elements.graphCanvas.getContext('2d');

  // ==========================================================================
  // 4. ROBUST MATHEMATICAL EXPRESSION PARSER
  // ==========================================================================
  
  class ExpressionParser {
    constructor(input, variables = {}, angleMode = 'DEG') {
      this.input = input;
      this.variables = variables;
      this.angleMode = angleMode;
      this.tokens = [];
      this.index = 0;
    }

    tokenize() {
      // Normalize visual arithmetic chars to parser equivalents
      let str = this.input.replace(/\s+/g, '')
                          .replace(/÷/g, '/')
                          .replace(/×/g, '*')
                          .replace(/−/g, '-');

      // Matching patterns: numbers/scientific numbers, trig/log functions, variables, operators
      const tokenRegex = /([0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)|(sin|cos|tan|log|ln|sqrt)|(pi|π|e|x|Ans)|([\+\-\*\/\^\%\(\)])/g;
      
      let match;
      const rawTokens = [];
      let lastIndex = 0;

      while ((match = tokenRegex.exec(str)) !== null) {
        if (match.index !== lastIndex) {
          throw new Error(`Syntax error near "${str.slice(lastIndex, match.index)}"`);
        }
        rawTokens.push(match[0]);
        lastIndex = tokenRegex.lastIndex;
      }

      if (lastIndex < str.length) {
        throw new Error(`Syntax error near "${str.slice(lastIndex)}"`);
      }

      // Add implicit multiplication tokens where syntax allows:
      // (e.g. "2(x+1)" becomes "2*(x+1)", "x sin(x)" becomes "x*sin(x)", "3pi" becomes "3*pi")
      const isClosingValueToken = (t) => {
        return /^[0-9.]/.test(t) || ['pi', 'π', 'e', 'x', 'Ans', ')'].includes(t);
      };

      const isOpeningValueToken = (t) => {
        return /^[0-9.]/.test(t) || ['pi', 'π', 'e', 'x', 'Ans', '(', 'sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(t);
      };

      for (let i = 0; i < rawTokens.length; i++) {
        this.tokens.push(rawTokens[i]);
        if (i < rawTokens.length - 1) {
          if (isClosingValueToken(rawTokens[i]) && isOpeningValueToken(rawTokens[i + 1])) {
            this.tokens.push('*');
          }
        }
      }
    }

    parse() {
      this.tokenize();
      if (this.tokens.length === 0) return 0;
      const result = this.parseExpression();
      if (this.index < this.tokens.length) {
        throw new Error(`Unexpected token "${this.tokens[this.index]}"`);
      }
      return result;
    }

    peek() {
      return this.tokens[this.index];
    }

    consume(token) {
      if (this.tokens[this.index] === token) {
        this.index++;
        return true;
      }
      return false;
    }

    // Parser grammar precedence rules:
    // Expression (addition/subtraction) -> Term (multiplication/division) -> Factor (percentage) -> Power (exponentiation) -> Primary (literals)

    parseExpression() {
      let value = this.parseTerm();
      while (true) {
        if (this.consume('+')) {
          value += this.parseTerm();
        } else if (this.consume('-')) {
          value -= this.parseTerm();
        } else {
          break;
        }
      }
      return value;
    }

    parseTerm() {
      let value = this.parseFactor();
      while (true) {
        if (this.consume('*')) {
          value *= this.parseFactor();
        } else if (this.consume('/')) {
          let divisor = this.parseFactor();
          if (divisor === 0) throw new Error("Div by 0");
          value /= divisor;
        } else {
          break;
        }
      }
      return value;
    }

    parseFactor() {
      let value = this.parsePower();
      while (this.consume('%')) {
        value /= 100;
      }
      return value;
    }

    parsePower() {
      let value = this.parsePrimary();
      if (this.consume('^')) {
        value = Math.pow(value, this.parsePower());
      }
      return value;
    }

    parsePrimary() {
      const token = this.peek();

      // Sign unary cases
      if (this.consume('-')) return -this.parsePrimary();
      if (this.consume('+')) return this.parsePrimary();

      // Nested expressions inside brackets
      if (this.consume('(')) {
        const value = this.parseExpression();
        if (!this.consume(')')) throw new Error("Mismatched '('");
        return value;
      }

      // Mathematical functions
      if (MATH_FUNCTIONS[token]) {
        this.index++;
        if (!this.consume('(')) throw new Error(`Missing '(' after ${token}`);
        const value = this.parseExpression();
        if (!this.consume(')')) throw new Error(`Missing ')' after ${token}`);
        return MATH_FUNCTIONS[token](value, this.angleMode === 'DEG');
      }

      // Math Constants
      if (token === 'pi' || token === 'π') {
        this.index++;
        return Math.PI;
      }
      if (token === 'e') {
        this.index++;
        return Math.E;
      }

      // Variables / Memory Ans
      if (token === 'x') {
        this.index++;
        if (this.variables.x === undefined) throw new Error("x is undefined");
        return this.variables.x;
      }
      if (token === 'Ans') {
        this.index++;
        return parseFloat(this.variables.Ans ?? 0);
      }

      // Numeric literals
      if (token && /^[0-9.]/.test(token)) {
        this.index++;
        const val = parseFloat(token);
        if (isNaN(val)) throw new Error(`Invalid number: ${token}`);
        return val;
      }

      throw new Error(`Unexpected token "${token || 'End'}"`);
    }
  }

  // Safe runner helper
  function evaluateMath(expression, variables = {}, angleMode = 'DEG') {
    return new ExpressionParser(expression, variables, angleMode).parse();
  }

  // ==========================================================================
  // 5. THEME SYSTEM
  // ==========================================================================
  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_calc_theme', theme);
    
    if (theme === 'dark') {
      elements.iconMoon.style.display = 'block';
      elements.iconSun.style.display = 'none';
    } else {
      elements.iconMoon.style.display = 'none';
      elements.iconSun.style.display = 'block';
    }
    
    if (state.activeTab === 'graphing') drawGraph();
  }

  elements.themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // ==========================================================================
  // 6. VIEW TAB PANELS SWITCHING
  // ==========================================================================
  
  function switchModeTab(targetTab) {
    state.activeTab = targetTab;
    
    elements.tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === targetTab));
    elements.panels.forEach(panel => panel.classList.toggle('active', panel.id === `panel-${targetTab}`));

    if (targetTab === 'graphing') {
      elements.appContainer.classList.add('graph-expanded');
      setTimeout(resizeCanvas, 100);
    } else {
      elements.appContainer.classList.remove('graph-expanded');
    }
  }

  elements.tabs.forEach(tab => {
    tab.addEventListener('click', (e) => switchModeTab(e.currentTarget.dataset.tab));
  });

  // ==========================================================================
  // 7. CALCULATOR ACTIONS & INTERACTION LOGIC
  // ==========================================================================
  
  function renderCalculatorDisplay() {
    elements.calcDisplay.style.color = state.calculator.isErrorState ? '#ef4444' : '';
    elements.calcDisplay.textContent = state.calculator.expression;
    elements.calcDisplay.scrollLeft = elements.calcDisplay.scrollWidth;
  }

  function insertCharToCalculator(char) {
    if (state.calculator.isErrorState) clearCalculator();

    const expr = state.calculator.expression;
    if (expr === '0') {
      state.calculator.expression = ['+', '*', '/', '^', '%'].includes(char) ? '0' + char : char === '.' ? '0.' : char;
    } else {
      state.calculator.expression += char;
    }
    renderCalculatorDisplay();
  }

  function clearCalculator() {
    state.calculator.expression = '0';
    state.calculator.isErrorState = false;
    elements.calcHistory.textContent = '';
    renderCalculatorDisplay();
  }

  function deleteCalculatorLast() {
    if (state.calculator.isErrorState) {
      clearCalculator();
      return;
    }

    const expr = state.calculator.expression;
    if (expr.length <= 1 || expr === '0') {
      state.calculator.expression = '0';
    } else {
      const complexTokens = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt(', 'Ans'];
      let tokenRemoved = false;

      for (const token of complexTokens) {
        if (expr.endsWith(token)) {
          state.calculator.expression = expr.slice(0, -token.length);
          tokenRemoved = true;
          break;
        }
      }

      if (!tokenRemoved) {
        state.calculator.expression = expr.slice(0, -1);
      }
    }

    if (state.calculator.expression === '') state.calculator.expression = '0';
    renderCalculatorDisplay();
  }

  function processCalculation() {
    const expr = state.calculator.expression;
    if (expr === '0' && elements.calcHistory.textContent === '') return;

    try {
      const parsedVal = evaluateMath(expr, { Ans: state.calculator.lastAnswer }, state.calculator.angleMode);
      let outputVal = parseFloat(Number(parsedVal.toFixed(10)).toString());

      elements.calcHistory.textContent = `${expr} =`;
      state.calculator.expression = outputVal.toString();
      state.calculator.lastAnswer = outputVal.toString();
      state.calculator.isErrorState = false;

      saveHistoryItem(expr, outputVal.toString());
    } catch (e) {
      elements.calcHistory.textContent = `${expr} =`;
      state.calculator.expression = e.message || 'Error';
      state.calculator.isErrorState = true;
    }
    renderCalculatorDisplay();
  }

  function updateAngleMode() {
    state.calculator.angleMode = state.calculator.angleMode === 'DEG' ? 'RAD' : 'DEG';
    elements.btnDegRad.textContent = state.calculator.angleMode;
    
    // Visual click indicator glow
    elements.btnDegRad.style.boxShadow = '0 0 15px var(--accent-purple)';
    setTimeout(() => elements.btnDegRad.style.boxShadow = '', 250);
  }

  // Bind Grid Clicks via Event Delegation
  const buttonGrid = document.querySelector('.button-grid');
  if (buttonGrid) {
    buttonGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn, .btn-equals');
      if (!btn) return;
      
      const data = btn.dataset;
      
      // Material Ripple Click Effect
      const clientRect = btn.getBoundingClientRect();
      const x = e.clientX - clientRect.left;
      const y = e.clientY - clientRect.top;
      const rippleEl = document.createElement('span');
      rippleEl.className = 'btn-ripple';
      rippleEl.style.left = `${x}px`;
      rippleEl.style.top = `${y}px`;
      btn.appendChild(rippleEl);
      setTimeout(() => rippleEl.remove(), 600);

      // Routing Click Commands
      if (data.insert !== undefined) {
        insertCharToCalculator(data.insert);
      } else if (data.action !== undefined) {
        switch (data.action) {
          case 'clear': clearCalculator(); break;
          case 'delete': deleteCalculatorLast(); break;
          case 'deg-rad': updateAngleMode(); break;
          case 'ans': insertCharToCalculator('Ans'); break;
          case 'evaluate': processCalculation(); break;
        }
      }
    });
  }

  // ==========================================================================
  // 8. GRAPHING LOGIC (COORDINATES ENGINE)
  // ==========================================================================
  
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const sizeRect = elements.graphCanvas.getBoundingClientRect();
    
    elements.graphCanvas.width = sizeRect.width * dpr;
    elements.graphCanvas.height = sizeRect.height * dpr;
    ctx.scale(dpr, dpr);
    
    drawGraph();
  }

  function getCanvasPixel(cx, cy, width, height) {
    const scaleX = width / (state.graphing.xMax - state.graphing.xMin);
    const scaleY = height / (state.graphing.yMax - state.graphing.yMin);
    return {
      x: (cx - state.graphing.xMin) * scaleX,
      y: (state.graphing.yMax - cy) * scaleY
    };
  }

  function getCartesianCoord(px, py, width, height) {
    const scaleX = width / (state.graphing.xMax - state.graphing.xMin);
    const scaleY = height / (state.graphing.yMax - state.graphing.yMin);
    return {
      x: state.graphing.xMin + px / scaleX,
      y: state.graphing.yMax - py / scaleY
    };
  }

  function drawGraph() {
    const scale = window.devicePixelRatio || 1;
    const width = elements.graphCanvas.width / scale;
    const height = elements.graphCanvas.height / scale;
    
    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const axisStyle = isDark ? '#475569' : '#94a3b8';
    const textStyle = isDark ? '#94a3b8' : '#475569';
    
    const { xMin, xMax, yMin, yMax } = state.graphing;
    
    // Choose step dynamically based on grid size range
    const range = xMax - xMin;
    let step = 1;
    if (range > 100) step = 20;
    else if (range > 50) step = 10;
    else if (range > 20) step = 5;
    else if (range > 5) step = 1;
    else if (range > 2) step = 0.5;
    else step = 0.1;

    ctx.lineWidth = 1;
    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = textStyle;

    // Draw X-axis Grid Lines (Vertical lines)
    const startingXGrid = Math.floor(xMin / step) * step;
    for (let cx = startingXGrid; cx <= xMax; cx += step) {
      const p = getCanvasPixel(cx, 0, width, height);
      const isYAxis = Math.abs(cx) < 1e-9;
      
      ctx.beginPath();
      ctx.strokeStyle = isYAxis ? axisStyle : gridStyle;
      ctx.lineWidth = isYAxis ? 2 : 1;
      ctx.moveTo(p.x, 0);
      ctx.lineTo(p.x, height);
      ctx.stroke();

      if (!isYAxis) {
        ctx.textAlign = 'center';
        const axisP = getCanvasPixel(0, 0, width, height);
        let py = axisP.y + 14;
        if (py < 12) py = 12;
        if (py > height - 6) py = height - 6;
        ctx.fillText(cx.toFixed(1).replace(/\.0$/, ''), p.x, py);
      }
    }

    // Draw Y-axis Grid Lines (Horizontal lines)
    const startingYGrid = Math.floor(yMin / step) * step;
    for (let cy = startingYGrid; cy <= yMax; cy += step) {
      const p = getCanvasPixel(0, cy, width, height);
      const isXAxis = Math.abs(cy) < 1e-9;

      ctx.beginPath();
      ctx.strokeStyle = isXAxis ? axisStyle : gridStyle;
      ctx.lineWidth = isXAxis ? 2 : 1;
      ctx.moveTo(0, p.y);
      ctx.lineTo(width, p.y);
      ctx.stroke();

      if (!isXAxis) {
        ctx.textAlign = 'right';
        const axisP = getCanvasPixel(0, 0, width, height);
        let px = axisP.x - 6;
        if (px < 32) px = 32;
        if (px > width - 6) px = width - 6;
        ctx.fillText(cy.toFixed(1).replace(/\.0$/, ''), px, p.y + 3);
      }
    }

    // Origin label
    const originP = getCanvasPixel(0, 0, width, height);
    if (originP.x >= 0 && originP.x <= width && originP.y >= 0 && originP.y <= height) {
      ctx.textAlign = 'right';
      ctx.fillText("0", originP.x - 6, originP.y + 12);
    }

    // Plot mathematical line
    const eq = state.graphing.expression;
    if (!eq) return;

    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#a78bfa' : '#6d28d9';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = isDark ? 6 : 0;
    ctx.shadowColor = 'rgba(139, 92, 246, 0.4)';

    let firstPoint = true;
    for (let px = 0; px < width; px++) {
      const cx = xMin + (px / width) * range;
      try {
        const cy = evaluateMath(eq, { x: cx }, 'RAD');
        if (typeof cy === 'number' && !isNaN(cy) && isFinite(cy)) {
          const canvasP = getCanvasPixel(cx, cy, width, height);
          if (firstPoint) {
            ctx.moveTo(canvasP.x, canvasP.y);
            firstPoint = false;
          } else {
            ctx.lineTo(canvasP.x, canvasP.y);
          }
        } else {
          firstPoint = true; // Break stroke at invalid points
        }
      } catch (err) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'left';
        ctx.fillText(`Plot Error: ${err.message}`, 20, 30);
        ctx.stroke();
        return;
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset canvas shadows
  }

  // --- Graph Controls Interactions ---
  
  elements.btnPlot.addEventListener('click', () => {
    state.graphing.expression = elements.graphExpression.value;
    drawGraph();
  });

  elements.graphExpression.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      state.graphing.expression = elements.graphExpression.value;
      drawGraph();
    }
  });

  elements.btnZoomIn.addEventListener('click', () => triggerScale(0.7));
  elements.btnZoomOut.addEventListener('click', () => triggerScale(1.4));

  elements.btnResetZoom.addEventListener('click', () => {
    state.graphing.xMin = -10;
    state.graphing.xMax = 10;
    state.graphing.yMin = -10;
    state.graphing.yMax = 10;
    drawGraph();
  });

  function triggerScale(factor) {
    const cx = (state.graphing.xMin + state.graphing.xMax) / 2;
    const cy = (state.graphing.yMin + state.graphing.yMax) / 2;
    const dx = (state.graphing.xMax - state.graphing.xMin) * factor;
    const dy = (state.graphing.yMax - state.graphing.yMin) * factor;
    
    state.graphing.xMin = cx - dx / 2;
    state.graphing.xMax = cx + dx / 2;
    state.graphing.yMin = cy - dy / 2;
    state.graphing.yMax = cy + dy / 2;
    
    drawGraph();
  }

  // Canvas Drag/Pan Handlers
  elements.graphCanvas.addEventListener('mousedown', (e) => {
    state.graphing.isDragging = true;
    state.graphing.dragStartX = e.clientX;
    state.graphing.dragStartY = e.clientY;
    state.graphing.dragStartMinX = state.graphing.xMin;
    state.graphing.dragStartMaxX = state.graphing.xMax;
    state.graphing.dragStartMinY = state.graphing.yMin;
    state.graphing.dragStartMaxY = state.graphing.yMax;
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.graphing.isDragging) return;
    
    const dxPixels = e.clientX - state.graphing.dragStartX;
    const dyPixels = e.clientY - state.graphing.dragStartY;
    
    const scale = window.devicePixelRatio || 1;
    const width = elements.graphCanvas.width / scale;
    const height = elements.graphCanvas.height / scale;
    
    const scaleX = width / (state.graphing.dragStartMaxX - state.graphing.dragStartMinX);
    const scaleY = height / (state.graphing.dragStartMaxY - state.graphing.dragStartMinY);
    
    state.graphing.xMin = state.graphing.dragStartMinX - dxPixels / scaleX;
    state.graphing.xMax = state.graphing.dragStartMaxX - dxPixels / scaleX;
    state.graphing.yMin = state.graphing.dragStartMinY + dyPixels / scaleY;
    state.graphing.yMax = state.graphing.dragStartMaxY + dyPixels / scaleY;
    
    drawGraph();
  });

  window.addEventListener('mouseup', () => state.graphing.isDragging = false);

  // Wheel Zoom Panning
  elements.graphCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const boundRect = elements.graphCanvas.getBoundingClientRect();
    const px = e.clientX - boundRect.left;
    const py = e.clientY - boundRect.top;
    
    const mousePos = getCartesianCoord(px, py, boundRect.width, boundRect.height);
    const scaleFactor = e.deltaY < 0 ? 0.85 : 1.15;
    
    const newDx = (state.graphing.xMax - state.graphing.xMin) * scaleFactor;
    const newDy = (state.graphing.yMax - state.graphing.yMin) * scaleFactor;
    
    const ratioX = px / boundRect.width;
    const ratioY = py / boundRect.height;
    
    state.graphing.xMin = mousePos.x - ratioX * newDx;
    state.graphing.xMax = mousePos.x + (1 - ratioX) * newDx;
    state.graphing.yMin = mousePos.y - (1 - ratioY) * newDy;
    state.graphing.yMax = mousePos.y + ratioY * newDy;
    
    drawGraph();
  }, { passive: false });

  // Touch Support
  elements.graphCanvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      state.graphing.isDragging = true;
      state.graphing.dragStartX = e.touches[0].clientX;
      state.graphing.dragStartY = e.touches[0].clientY;
      state.graphing.dragStartMinX = state.graphing.xMin;
      state.graphing.dragStartMaxX = state.graphing.xMax;
      state.graphing.dragStartMinY = state.graphing.yMin;
      state.graphing.dragStartMaxY = state.graphing.yMax;
    }
  });

  elements.graphCanvas.addEventListener('touchmove', (e) => {
    if (!state.graphing.isDragging || e.touches.length !== 1) return;
    const scale = window.devicePixelRatio || 1;
    const width = elements.graphCanvas.width / scale;
    const height = elements.graphCanvas.height / scale;

    const dx = e.touches[0].clientX - state.graphing.dragStartX;
    const dy = e.touches[0].clientY - state.graphing.dragStartY;

    const scaleX = width / (state.graphing.dragStartMaxX - state.graphing.dragStartMinX);
    const scaleY = height / (state.graphing.dragStartMaxY - state.graphing.dragStartMinY);

    state.graphing.xMin = state.graphing.dragStartMinX - dx / scaleX;
    state.graphing.xMax = state.graphing.dragStartMaxX - dx / scaleX;
    state.graphing.yMin = state.graphing.dragStartMinY + dy / scaleY;
    state.graphing.yMax = state.graphing.dragStartMaxY + dy / scaleY;

    drawGraph();
  });

  elements.graphCanvas.addEventListener('touchend', () => state.graphing.isDragging = false);

  window.addEventListener('resize', () => {
    if (state.activeTab === 'graphing') resizeCanvas();
  });

  // ==========================================================================
  // 9. CONVERTER HANDLERS & COMPUTATIONS
  // ==========================================================================
  
  function populateConverterSelector() {
    const currentCategory = elements.converterType.value;
    const unitsMap = UNIT_CONFIGS[currentCategory].units;
    
    elements.converterFromUnit.innerHTML = '';
    elements.converterToUnit.innerHTML = '';
    
    Object.keys(unitsMap).forEach(key => {
      const name = unitsMap[key].name;
      
      const optFrom = new Option(name, key);
      const optTo = new Option(name, key);
      
      elements.converterFromUnit.add(optFrom);
      elements.converterToUnit.add(optTo);
    });

    const keys = Object.keys(unitsMap);
    elements.converterFromUnit.value = keys[0];
    elements.converterToUnit.value = keys[1] || keys[0];
    
    executeConversion();
  }

  function executeConversion() {
    const category = elements.converterType.value;
    const fromUnit = elements.converterFromUnit.value;
    const toUnit = elements.converterToUnit.value;
    const inputVal = parseFloat(elements.converterFromValue.value);

    if (isNaN(inputVal)) {
      elements.converterToValue.value = '';
      return;
    }

    if (fromUnit === toUnit) {
      elements.converterToValue.value = inputVal;
      return;
    }

    let calculated = 0;

    if (category === 'temperature') {
      let cVal = 0;
      if (fromUnit === 'C') cVal = inputVal;
      else if (fromUnit === 'F') cVal = ((inputVal - 32) * 5) / 9;
      else if (fromUnit === 'K') cVal = inputVal - 273.15;

      if (toUnit === 'C') calculated = cVal;
      else if (toUnit === 'F') calculated = (cVal * 9) / 5 + 32;
      else if (toUnit === 'K') calculated = cVal + 273.15;
    } else {
      const unitsMap = UNIT_CONFIGS[category].units;
      const valInBase = inputVal * unitsMap[fromUnit].factor;
      calculated = valInBase / unitsMap[toUnit].factor;
    }

    elements.converterToValue.value = parseFloat(calculated.toFixed(8)).toString();
  }

  elements.converterType.addEventListener('change', populateConverterSelector);
  elements.converterFromValue.addEventListener('input', executeConversion);
  elements.converterFromUnit.addEventListener('change', executeConversion);
  elements.converterToUnit.addEventListener('change', executeConversion);

  elements.btnConverterSwap.addEventListener('click', () => {
    const oldFrom = elements.converterFromUnit.value;
    elements.converterFromUnit.value = elements.converterToUnit.value;
    elements.converterToUnit.value = oldFrom;

    const oldResult = elements.converterToValue.value;
    if (oldResult !== '') {
      elements.converterFromValue.value = oldResult;
    }

    executeConversion();

    elements.btnConverterSwap.style.transform = 'rotate(180deg) scale(1.1)';
    setTimeout(() => elements.btnConverterSwap.style.transform = '', 250);
  });

  // ==========================================================================
  // 10. HISTORY MANAGEMENT SERVICE
  // ==========================================================================
  
  function initHistory() {
    try {
      const cached = localStorage.getItem('aura_calc_history');
      state.history = cached ? JSON.parse(cached) : [];
    } catch (e) {
      state.history = [];
    }
    renderHistorySidebar();
  }

  function saveHistoryItem(expression, result) {
    state.history.unshift({ expression, result });
    if (state.history.length > 50) state.history.pop();
    
    localStorage.setItem('aura_calc_history', JSON.stringify(state.history));
    renderHistorySidebar();
  }

  function renderHistorySidebar() {
    elements.historyList.innerHTML = '';
    
    if (state.history.length === 0) {
      elements.historyList.innerHTML = `
        <div class="empty-history-msg">No calculations yet. Perform basic calculations to build up history!</div>
      `;
      return;
    }

    state.history.forEach(item => {
      const itemBtn = document.createElement('button');
      itemBtn.className = 'history-item';
      itemBtn.setAttribute('aria-label', `${item.expression} equals ${item.result}`);

      const exprSpan = document.createElement('span');
      exprSpan.className = 'history-item-expression';
      exprSpan.textContent = item.expression;

      const resultSpan = document.createElement('span');
      resultSpan.className = 'history-item-result';
      resultSpan.textContent = item.result;

      itemBtn.appendChild(exprSpan);
      itemBtn.appendChild(resultSpan);

      itemBtn.addEventListener('click', () => {
        state.calculator.expression = item.expression;
        state.calculator.isErrorState = false;
        elements.calcHistory.textContent = '';
        renderCalculatorDisplay();
        switchModeTab('calculator');
        hideHistoryPanel();
      });

      elements.historyList.appendChild(itemBtn);
    });
  }

  function showHistoryPanel() {
    elements.historySidebar.classList.add('open');
    elements.sidebarBackdrop.classList.add('active');
  }

  function hideHistoryPanel() {
    elements.historySidebar.classList.remove('open');
    elements.sidebarBackdrop.classList.remove('active');
  }

  elements.btnHistoryToggle.addEventListener('click', showHistoryPanel);
  elements.btnHistoryClose.addEventListener('click', hideHistoryPanel);
  elements.sidebarBackdrop.addEventListener('click', hideHistoryPanel);

  elements.btnHistoryClear.addEventListener('click', () => {
    state.history = [];
    localStorage.removeItem('aura_calc_history');
    renderHistorySidebar();
  });

  // ==========================================================================
  // 11. PHYSICAL KEYBOARD HOOK SYSTEM
  // ==========================================================================
  
  window.addEventListener('keydown', (e) => {
    if (document.activeElement === elements.graphExpression || 
        document.activeElement === elements.converterFromValue) {
      return; // Skip if inputs are focused
    }

    const key = e.key;
    
    // Digits
    if (key >= '0' && key <= '9') {
      insertCharToCalculator(key);
      animateBtn(document.querySelector(`button[data-insert="${key}"]`));
      return;
    }

    // Special operations
    const mappedSelector = KEY_MAPPINGS[key];
    if (mappedSelector) {
      if (['Enter', '=', 'Backspace', 'Escape', '/'].includes(key)) {
        e.preventDefault();
      }

      switch (key) {
        case 'Enter':
        case '=':
          processCalculation();
          break;
        case 'Backspace':
          deleteCalculatorLast();
          break;
        case 'Escape':
          clearCalculator();
          break;
        default:
          insertCharToCalculator(key);
          break;
      }
      animateBtn(document.querySelector(mappedSelector));
    }
  });

  function animateBtn(btn) {
    if (!btn) return;
    btn.classList.add('keyboard-active');
    setTimeout(() => btn.classList.remove('keyboard-active'), 100);
  }

  // ==========================================================================
  // 12. INITIALIZATION
  // ==========================================================================
  
  const savedTheme = localStorage.getItem('aura_calc_theme') || 'dark';
  applyTheme(savedTheme);
  populateConverterSelector();
  initHistory();
  renderCalculatorDisplay();

  // Inject dynamic ripple style rules
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    .btn-ripple {
      position: absolute;
      background: rgba(255, 255, 255, 0.22);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: button-ripple-animation 0.6s linear;
      pointer-events: none;
    }
    [data-theme="light"] .btn-ripple {
      background: rgba(0, 0, 0, 0.08);
    }
    @keyframes button-ripple-animation {
      to {
        transform: translate(-50%, -50%) scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);
