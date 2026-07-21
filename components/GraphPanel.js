class GraphPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="panel-graphing" class="tab-panel">
        <div class="graph-layout">
          <div class="graph-input-container">
            <label for="graph-expression" class="input-label">Function to Plot</label>
            <div class="graph-expression-input-wrapper">
              <span class="equation-prefix">y = f(x) =</span>
              <input type="text" id="graph-expression" placeholder="x * sin(x)" value="x * sin(x)">
            </div>
            <div class="graph-controls-buttons">
              <button id="btn-plot" class="primary-btn">Plot Function</button>
              <button id="btn-zoom-in" class="icon-btn" aria-label="Zoom in">
                <svg class="icon icon-sm"><use href="#icon-zoom-in"></use></svg>
              </button>
              <button id="btn-zoom-out" class="icon-btn" aria-label="Zoom out">
                <svg class="icon icon-sm"><use href="#icon-zoom-out"></use></svg>
              </button>
              <button id="btn-reset-zoom" class="text-btn">Reset Grid</button>
            </div>
          </div>
          <div class="canvas-wrapper">
            <canvas id="graph-canvas" width="600" height="400"></canvas>
            <div class="canvas-instructions">Drag to pan | Scroll to zoom</div>
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('graph-panel', GraphPanel);
