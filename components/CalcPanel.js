class CalcPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="panel-calculator" class="tab-panel active">
        <!-- Display Screen -->
        <div class="calc-screen">
          <div id="calc-history" class="screen-history" aria-live="polite"></div>
          <div id="calc-display" class="screen-current" aria-live="polite">0</div>
        </div>

        <!-- Button Grid (IDs removed in favor of data-attributes and event delegation) -->
        <div class="button-grid">
          <!-- Scientific row 1 -->
          <button id="btn-deg-rad" class="btn btn-sci" data-action="deg-rad">DEG</button>
          <button class="btn btn-sci" data-insert="sin(">sin</button>
          <button class="btn btn-sci" data-insert="cos(">cos</button>
          <button class="btn btn-sci" data-insert="tan(">tan</button>

          <!-- Scientific row 2 -->
          <button class="btn btn-sci" data-insert="π">π</button>
          <button class="btn btn-sci" data-insert="e">e</button>
          <button class="btn btn-sci" data-insert="^">x<sup>y</sup></button>
          <button class="btn btn-sci" data-insert="sqrt(">√</button>

          <!-- Scientific row 3 -->
          <button class="btn btn-sci" data-insert="ln(">ln</button>
          <button class="btn btn-sci" data-insert="log(">log</button>
          <button class="btn btn-sci" data-insert="(">(</button>
          <button class="btn btn-sci" data-insert=")">)</button>

          <!-- Row 1 Main -->
          <button class="btn btn-action" data-action="clear">AC</button>
          <button class="btn btn-action" data-action="delete">DEL</button>
          <button class="btn btn-action" data-insert="%">%</button>
          <button class="btn btn-operator" data-insert="/">÷</button>

          <!-- Row 2 Main -->
          <button class="btn btn-num" data-insert="7">7</button>
          <button class="btn btn-num" data-insert="8">8</button>
          <button class="btn btn-num" data-insert="9">9</button>
          <button class="btn btn-operator" data-insert="*">×</button>

          <!-- Row 3 Main -->
          <button class="btn btn-num" data-insert="4">4</button>
          <button class="btn btn-num" data-insert="5">5</button>
          <button class="btn btn-num" data-insert="6">6</button>
          <button class="btn btn-operator" data-insert="-">−</button>

          <!-- Row 4 Main -->
          <button class="btn btn-num" data-insert="1">1</button>
          <button class="btn btn-num" data-insert="2">2</button>
          <button class="btn btn-num" data-insert="3">3</button>
          <button class="btn btn-operator" data-insert="+">+</button>

          <!-- Row 5 Main -->
          <button class="btn btn-sci" data-action="ans">Ans</button>
          <button class="btn btn-num" data-insert="0">0</button>
          <button class="btn btn-num" data-insert=".">.</button>
          <button class="btn btn-equals" data-action="evaluate">=</button>
        </div>
      </section>
    `;
  }
}
customElements.define('calc-panel', CalcPanel);
