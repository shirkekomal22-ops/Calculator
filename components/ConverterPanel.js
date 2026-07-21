class ConverterPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="panel-converter" class="tab-panel">
        <div class="converter-layout">
          <!-- Converter Options -->
          <div class="converter-category">
            <label for="converter-type" class="input-label">Category</label>
            <select id="converter-type">
              <option value="length">Length</option>
              <option value="weight">Mass / Weight</option>
              <option value="temperature">Temperature</option>
            </select>
          </div>

          <div class="converter-grids">
            <!-- From side -->
            <div class="converter-box">
              <label for="converter-from-value" class="input-label">From</label>
              <input type="number" id="converter-from-value" value="1" placeholder="Enter value">
              <select id="converter-from-unit" aria-label="From Unit"></select>
            </div>
            <!-- Swap Button -->
            <button id="btn-converter-swap" class="icon-btn swap-btn" aria-label="Swap units">
              <svg class="icon"><use href="#icon-swap"></use></svg>
            </button>
            <!-- To side -->
            <div class="converter-box">
              <label for="converter-to-value" class="input-label">To</label>
              <input type="number" id="converter-to-value" value="0" readonly placeholder="Result">
              <select id="converter-to-unit" aria-label="To Unit"></select>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('converter-panel', ConverterPanel);
